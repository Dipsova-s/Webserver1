using System;
using System.ComponentModel;
using System.Reflection;

namespace EveryAngle.ManagementConsole.Helpers
{
    public enum MessageType
    {
        DEFAULT = 0,
        [Description("Item succesfully updated!")]
        SUCCESS_UPDATED = 1,
        [Description("Package file is required")]
        REQUIRE_PACKAGE = 2,
        [Description("Invalid or malformed JSON")]
        JSON_INVALID = 3,
        [Description("The maximum comments(99) has been reached")]
        COMMENT_LIMIT = 4
    }

    public class ManagementConsoleEnumHelper
    {
        public static string GetMessage(MessageType type)
        {
            return type == MessageType.DEFAULT ? 
                   string.Empty : 
                   GetEnumDescription(type);
        }

        public static string GetEnumDescription(Enum value)
        {
            FieldInfo fi = value.GetType().GetField(value.ToString());
            DescriptionAttribute[] attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);

            if (attributes != null &&
                attributes.Length > 0)
                return attributes[0].Description;
            return value.ToString();
        }
    }
}
