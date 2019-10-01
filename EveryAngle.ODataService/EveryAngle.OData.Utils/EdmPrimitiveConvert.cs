using EveryAngle.OData.DTO;
using Microsoft.Data.Edm;
using System;
using System.Collections.Generic;

namespace EveryAngle.OData.Utils
{
    public static class EdmPrimitiveConvert
    {
        static Dictionary<string, EdmPrimitiveTypeKind> EdmPrimitiveTypeMapper = new Dictionary<string, EdmPrimitiveTypeKind>
        {
            { "int", EdmPrimitiveTypeKind.Int64 },
            { "period", EdmPrimitiveTypeKind.Int64 },
            
            { "percentage", EdmPrimitiveTypeKind.Double },
            { "double", EdmPrimitiveTypeKind.Double },
            { "timespan", EdmPrimitiveTypeKind.Double },

            { "currency", EdmPrimitiveTypeKind.Decimal },

            { "date", EdmPrimitiveTypeKind.DateTime },
            { "datetime", EdmPrimitiveTypeKind.DateTime },
            { "duration", EdmPrimitiveTypeKind.DateTime },

            { "time", EdmPrimitiveTypeKind.Time },

            { "boolean", EdmPrimitiveTypeKind.Boolean },
        };

        // determine Edm kind from field type
        public static EdmPrimitiveTypeKind? GetKind(Field field)
        {
            return GetKind(field.fieldtype);
        }

        public static EdmPrimitiveTypeKind? GetKind(string field)
        {
            if (field == null || !EdmPrimitiveTypeMapper.TryGetValue(field, out EdmPrimitiveTypeKind type))
            {
                type = EdmPrimitiveTypeKind.String;
            }
            return type;
        }
    }
}
