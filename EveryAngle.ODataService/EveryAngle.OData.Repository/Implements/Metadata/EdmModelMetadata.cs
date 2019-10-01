using EveryAngle.OData.DTO;
using EveryAngle.OData.Utils;
using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Csdl;
using Microsoft.Data.Edm.Library;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Repository
{
    public class EdmModelMetadata : IEdmModelMetadata
    {
        #region constructor

        public EdmModelMetadata() { }

        public EdmModelMetadata(ModelType modelType)
        {
            // new odata edm model metadata instantiate
            EdmModel = new EdmModel();
            EdmModel.SetEdmVersion(new Version("2.0"));
            EdmModel.SetNamespacePrefixMappings(new[] { new KeyValuePair<string, string>("EA", "http://everyangle.org/schema") });

            // new metadata instantiate
            Angles = new ConcurrentDictionary<AngleCompositeKey, Angle>();
            Fields = new ConcurrentDictionary<FieldCompositeKey, Field>();
            UnavailableItems = new ConcurrentDictionary<object, object>();
            CurrentInstance = string.Empty;

            // new odata edm container instantiate
            ModelType = modelType;
            Container = new EdmEntityContainer("EA", "DefaultContainer");
            RoutingDescriptors = new ConcurrentDictionary<string, HttpControllerDescriptor>();
            EdmModel.AddElement(Container);
        }

        #endregion

        #region public variables

        // set of metadata using uri as a key
        public ConcurrentDictionary<AngleCompositeKey, Angle> Angles { get; set; }
        public IEnumerable<Display> Displays { get { return Angles.Values
                                                            .Where(angle => angle.display_definitions != null && angle.display_definitions.Any())
                                                            .SelectMany(angle => angle.display_definitions); } }

        public ConcurrentDictionary<FieldCompositeKey, Field> Fields { get; set; }
        public ConcurrentDictionary<object, object> UnavailableItems { get; set; }

        // entity
        public EdmModel EdmModel { get; set; }
        public EdmEntityContainer Container { get; set; }
        public ModelType ModelType { get; set; }
        public bool IsMaster { get { return ModelType == ModelType.Master; } }

        // routing descriptor
        public ConcurrentDictionary<string, HttpControllerDescriptor> RoutingDescriptors { get; set; }

        // current processing model instance
        public string CurrentInstance { get; set; }

        #endregion
    }
}
