using EveryAngle.OData.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Builder.ControllerSelectors
{
    public interface IRoutingControllerSelector
    {
        HttpControllerDescriptor CreateDisplayDescriptor(string entitySetName, Display display, Type routingControllerType);
    }
}
