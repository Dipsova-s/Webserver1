using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.BusinessLogic.Implements.Authorizations;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.BusinessLogic.Interfaces.Authorizations;
using EveryAngle.OData.BusinessLogic.Rows;
using EveryAngle.OData.Collector;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using EveryAngle.Utilities.IoC;
using SimpleInjector;
using SimpleInjector.Extensions.ExecutionContextScoping;
using System;
using System.Collections.Generic;

namespace EveryAngle.OData.IoC
{
    public class IoCContainer : ContainerAdapterBase
    {
        #region private variables

        private static Container _container;

        #endregion

        #region public functions

        public override void Prepare()
        {
            #region initialze

            // init container to automatically inject the same slave/master metadata container
            InitialContainerMetadataContainer();

            _container = new Container();

            #endregion

            #region collectors

            _container.RegisterSingleton<IAngleDataCollector, AngleDataCollector>();

            #endregion

            #region proxy

            _container.RegisterSingleton<IAppServerProxy, AppServerProxy>();
            _container.RegisterSingleton<IEARestClient, EARestClient>();

            #endregion

            #region business logics

            _container.RegisterSingleton<IMasterEdmModelBusinessLogic, MasterEdmModelBusinessLogic>();
            _container.RegisterSingleton<ISlaveEdmModelBusinessLogic, SlaveEdmModelBusinessLogic>();
            _container.RegisterSingleton<IRowsEdmBusinessLogic, RowsEdmBusinessLogic>();
            _container.RegisterSingleton<IOdataAuthorizations, OdataAuthorizations>();

            #endregion

            _container.Verify();
        }

        public override IContainerAdapter CreateChildContainerAdapter()
        {
            return new ScopedContainer(_container);
        }

        public override object Resolve(Type type)
        {
            return _container.GetInstance(type);
        }

        public override IEnumerable<object> ResolveAll(Type type)
        {
            return _container.GetAllInstances(type);
        }

        public override void Dispose()
        {
            // Allow the container and everything it references to be garbage collected.
            _container = null;
        }

        public override bool IsRegistered(Type type)
        {
            return _container.GetRegistration(type, false) != null;
        }

        public override T Resolve<T>()
        {
            return (T)_container.GetInstance(typeof(T));
        }

        #endregion

        #region private functions

        private void InitialContainerMetadataContainer()
        {
            if (EdmModelContainer.Status == EdmModelStatus.Idle)
                EdmModelContainer.Initialize();
        }

        #endregion
    }

    internal class ScopedContainer : IoCContainer
    {
        #region private variables

        private readonly Scope _scope;

        #endregion

        #region constructor

        public ScopedContainer(Container container)
        {
            _scope = container.BeginExecutionContextScope();
        }

        #endregion

        #region public functions

        public override void Dispose()
        {
            _scope.Dispose();
        }

        #endregion
    }
}
