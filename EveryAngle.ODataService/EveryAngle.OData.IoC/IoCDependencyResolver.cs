using EveryAngle.Utilities.IoC;
using System;
using System.Collections.Generic;
using System.Web.Http.Dependencies;

namespace EveryAngle.OData.IoC
{
    public class IoCDependencyResolver : ScopeContainer, IDependencyResolver
    {
        public IoCDependencyResolver(IContainerAdapter container)
            : base(container)
        {
        }

        public IDependencyScope BeginScope()
        {
            IContainerAdapter child = container.CreateChildContainerAdapter();
            return new ScopeContainer(child);
        }
    }

    public class ScopeContainer : IDependencyScope
    {
        protected readonly IContainerAdapter container;

        public ScopeContainer(IContainerAdapter container)
        {
            if (container == null)
            {
                throw new ArgumentNullException("container");
            }
            this.container = container;
        }

        public object GetService(Type serviceType)
        {
            return container.IsRegistered(serviceType) ? container.Resolve(serviceType) : null;
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return container.IsRegistered(serviceType) ? container.ResolveAll(serviceType) : new List<object>();
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
            container.Dispose();
        }
    }
}
