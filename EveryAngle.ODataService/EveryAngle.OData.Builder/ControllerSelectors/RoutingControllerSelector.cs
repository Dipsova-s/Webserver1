using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using System;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Dispatcher;

namespace EveryAngle.OData.Builder.ControllerSelectors
{
    public class RoutingControllerSelector : DefaultHttpControllerSelector, IRoutingControllerSelector
    {
        IMasterEdmModelBusinessLogic _edmModelBusinessLogic;
        HttpConfiguration _configuration;

        public RoutingControllerSelector(
            IMasterEdmModelBusinessLogic edmModelBusinessLogic,
            HttpConfiguration configuration)
            : base(configuration)
        {
            _edmModelBusinessLogic = edmModelBusinessLogic;
            _configuration = configuration;
        }

        public override HttpControllerDescriptor SelectController(HttpRequestMessage request)
        {
            string entitySetName = GetControllerName(request);

            if (entitySetName != null)
            {
                HttpControllerDescriptor desc;
                if (_edmModelBusinessLogic.GetAngleDisplayDescriptor(entitySetName, out desc))
                    return desc;
            }

            return base.SelectController(request);
        }

        public HttpControllerDescriptor CreateDisplayDescriptor(string entitySetName, Display display, Type routingControllerType)
        {
            if (entitySetName == null)
                throw new ArgumentNullException("name");

            if (display == null)
                throw new ArgumentNullException("display");

            // create a descriptor with extra properties that the controller needs
            HttpControllerDescriptor desc = new HttpControllerDescriptor(_configuration, entitySetName, routingControllerType);
            desc.Properties["display"] = display;

            return desc;
        }
    }
}