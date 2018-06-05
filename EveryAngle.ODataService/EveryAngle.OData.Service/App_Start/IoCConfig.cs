using EveryAngle.OData.IoC;
using EveryAngle.Utilities.IoC;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Dependencies;
using SimpleInjector;
using SimpleInjector.Extensions.LifetimeScoping;
using SimpleInjector.Extensions.ExecutionContextScoping;

namespace EveryAngle.OData.Service.App_Start
{
    public static class IoCConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Initial IoC
            IContainerAdapter container = new IoCContainer();

            //Create Object factory
            ObjectFactory.CreateFactory(container);

            container.Prepare();
            config.DependencyResolver = new IoCDependencyResolver(container);
        }
    }
}