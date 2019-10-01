using EveryAngle.OData.BackgroundWorkers;
using EveryAngle.OData.Builder.Metadata;
using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.IoC;
using EveryAngle.OData.ODataControllers;
using EveryAngle.OData.Service;
using EveryAngle.OData.Service.APIs;
using EveryAngle.OData.Builder.ControllerSelectors;
using EveryAngle.OData.Service.Handlers;
using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Logs;
using EveryAngle.Utilities.IoC;
using Microsoft.Data.Edm;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Dispatcher;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Query;
using System.Web.Http.OData.Routing;
using System.Web.Http.OData.Routing.Conventions;
using System.Web.Routing;
using EveryAngle.OData.Settings;

namespace EveryAngle.OData.App_Start
{
    public static class ODataApiConfig
    {
        private static ODataRoute _odataRoute;
        private static HttpConfiguration _configuration;
        private static RoutingControllerSelector _selector;
        private static IList<IODataRoutingConvention> _conventions;
        private static readonly CancellationTokenSource _tokenSource = new CancellationTokenSource();
        private static IMasterEdmModelBusinessLogic _masterEdmModelBusinessLogic;
        private static ISlaveEdmModelBusinessLogic _slaveEdmModelBusinessLogic;

        internal static void Initial(IMasterEdmModelBusinessLogic masterEdmModelBusinessLogic, ISlaveEdmModelBusinessLogic slaveEdmModelBusinessLogic)
        {
            if (_masterEdmModelBusinessLogic == null)
                _masterEdmModelBusinessLogic = masterEdmModelBusinessLogic;
            if (_slaveEdmModelBusinessLogic == null)
                _slaveEdmModelBusinessLogic = slaveEdmModelBusinessLogic;
        }

        public static void Register(HttpConfiguration config)
        {
            // set handlers
            Initial(ObjectFactory.GetInstance<IMasterEdmModelBusinessLogic>(), ObjectFactory.GetInstance<ISlaveEdmModelBusinessLogic>());

            // start sync metadata when start an app
            // create an OData descriptor with extra properties that the controller needs
            _configuration = config;
            _selector = new RoutingControllerSelector(_masterEdmModelBusinessLogic, _configuration);
            _configuration.Services.Replace(typeof(IHttpControllerSelector), _selector);

            // Create the default collection of built-in conventions.
            _conventions = ODataRoutingConventions.CreateDefault();

            // then re-configure api entry follow by the metadata descriptor
            ReConfigureWebApiEntry(false);

            // asynchronously sync metadata process running
            RunSyncMetadataProcess();
            
            // even we enable 'all' functionality, API still have no support the most of them.
            _configuration.AddODataQueryFilter(new EnableQueryAttribute
            {
                AllowedQueryOptions = AllowedQueryOptions.All,
                HandleNullPropagation = HandleNullPropagationOption.True,
                PageSize = ODataSettings.Settings.PageSize
            });

            // register odata default route
            _odataRoute = _configuration.Routes.MapODataServiceRoute(
                            routeName: "odata",
                            routePrefix: "odata",
                            model: _slaveEdmModelBusinessLogic.GetEdmModel(),
                            pathHandler: new ODataCustomPathHandler(),
                            routingConventions: _conventions);
        }

        public static void RunSyncMetadataProcess()
        {
            RunSyncMetadataProcess(true);
        }

        public static void RunSyncMetadataProcess(bool retryChecking)
        {
            // set handlers
            Initial(ObjectFactory.GetInstance<IMasterEdmModelBusinessLogic>(), ObjectFactory.GetInstance<ISlaveEdmModelBusinessLogic>());

            // sync metadata can be immediately start(dueTime == 0) with interval cycle from background process, run it as an Action context.
            if (_slaveEdmModelBusinessLogic.IsAppServerAvailable(retryChecking))
                SyncMetadataProcess.RunAsync(0, ODataSettings.Settings.MetadataResyncMinutes, _tokenSource, SyncMetadataWithApiServiceEntry);
        }

        internal static void SyncMetadataWithApiServiceEntry()
        {
            LogService.Info("Start sync metadata..");

            // set sync raw data from AS to slave's container models, in case of to not interrupt user from application using
            if (_slaveEdmModelBusinessLogic.SyncModelMetadata())
            {
                // then build a new metadata including entry point and path dynamically on RowsController 
                ModelBuilder modelBuilder = new ModelBuilder(_slaveEdmModelBusinessLogic, _selector, typeof(RowsController));
                modelBuilder.BuildModel();

                // finally switch a to new master model
                _slaveEdmModelBusinessLogic.SwitchSlaveToMasterModel();

                // after finish all preparation on slave then if the last routing is in use,ma
                // clear all routes and register a new one with new master model
                if (_odataRoute != null)
                {
                    // after metadata was sync(ed), refresh the dynamic routes, processing modelthe then assign metadata model
                    RouteTable.Routes.Clear();
                    _odataRoute = _configuration.Routes.MapODataServiceRoute(
                                    routeName: "odata",
                                    routePrefix: "odata",
                                    model: _masterEdmModelBusinessLogic.GetEdmModel(),
                                    pathHandler: new ODataCustomPathHandler(),
                                    routingConventions: _conventions);

                    // re-config api entry
                    ReConfigureWebApiEntry(true);

                    // register an api entry on runtime then ensure that the apis are init(ed)
                    RouteConfig.RegisterRoutes(RouteTable.Routes);
                    _configuration.EnsureInitialized();
                }
            }

            // to get rid og LOH fragment, wrap up memory after metadata is synced
            _slaveEdmModelBusinessLogic.ClearUnusedMemory();

            LogService.Info("Finish sync metadata..");
        }

        private static void ReConfigureWebApiEntry(bool registerEntry)
        {
            if (registerEntry)
                WebApiConfig.Register(_configuration);

            // create an API descriptor with extra properties that the controller needs
            // should move this one to other place, maybe SettingsApi.Resgister + SyncMetadataApi.Register
            SetRoutingDescriptor(typeof(ODataSettingsApiController), "settings");
            SetRoutingDescriptor(typeof(SyncMetadataApiController), "metadata");
            SetRoutingDescriptor(typeof(AppEntryApiController), "entry");
        }

        private static void SetRoutingDescriptor(Type apiControllerType, string controllerName)
        {
            HttpControllerDescriptor descriptor = new HttpControllerDescriptor(_configuration, controllerName, apiControllerType);
            _masterEdmModelBusinessLogic.SetAngleDisplayDescriptor(controllerName, descriptor);
        }
    }
}