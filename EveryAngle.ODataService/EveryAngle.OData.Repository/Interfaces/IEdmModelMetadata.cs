using EveryAngle.OData.DTO;
using Microsoft.Data.Edm.Library;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Repository
{
    public interface IEdmModelMetadata
    {
        ConcurrentDictionary<AngleCompositeKey, Angle> Angles { get; set; }
        IEnumerable<Display> Displays { get; }
        ConcurrentDictionary<FieldCompositeKey, Field> Fields { get; set; }

        EdmModel EdmModel { get; set; }
        EdmEntityContainer Container { get; set; }
        ConcurrentDictionary<string, HttpControllerDescriptor> RoutingDescriptors { get; set; }

        ModelType ModelType { get; set; }
        bool IsMaster { get; }

        string CurrentInstance { get; set; }
    }
}
