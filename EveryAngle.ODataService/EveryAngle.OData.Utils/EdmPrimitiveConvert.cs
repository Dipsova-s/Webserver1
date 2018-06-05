using EveryAngle.OData.DTO;
using Microsoft.Data.Edm;

namespace EveryAngle.OData.Utils
{
    public class EdmPrimitiveConvert
    {
        // determine Edm kind from field type
        public static EdmPrimitiveTypeKind? GetKind(Field field)
        {
            return GetKind(field.fieldtype);
        }

        public static EdmPrimitiveTypeKind? GetKind(string field)
        {
            switch (field)
            {
                case "int":
                case "period":
                    return EdmPrimitiveTypeKind.Int64;
                case "percentage":
                case "double":
                case "timespan":
                    return EdmPrimitiveTypeKind.Double;
                case "currency":
                    return EdmPrimitiveTypeKind.Decimal;
                case "date":
                case "datetime":
                    return EdmPrimitiveTypeKind.DateTime;
                case "time":
                    return EdmPrimitiveTypeKind.Time;
                case "duration":
                    return EdmPrimitiveTypeKind.DateTime;
                case "boolean":
                    return EdmPrimitiveTypeKind.Boolean;
                case "text":
                case null:
                default:
                    return EdmPrimitiveTypeKind.String;
            }
        }
    }
}
