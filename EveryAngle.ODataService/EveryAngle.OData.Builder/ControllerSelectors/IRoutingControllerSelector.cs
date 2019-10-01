using EveryAngle.OData.DTO;
using System;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Builder.ControllerSelectors
{
    public interface IRoutingControllerSelector
    {
        HttpControllerDescriptor CreateDisplayDescriptor(string entitySetName, Display display, Type routingControllerType);
    }
}
