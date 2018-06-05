using Microsoft.Data.Edm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.OData.Routing;

namespace EveryAngle.OData.Service.Handlers
{
    public class ODataCustomPathHandler : DefaultODataPathHandler
    {
        public override ODataPath Parse(IEdmModel model, string odataPath)
        {
            // any OData request will be represent here before finding a route in selector.
            return base.Parse(model, odataPath);
        }
    }
}