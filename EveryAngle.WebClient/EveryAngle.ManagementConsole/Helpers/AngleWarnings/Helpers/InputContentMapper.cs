using System;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public static class InputContentMapper
    {
        private static readonly string[] ReplaceFields_warnings = { "unsupported_display_field",
                                                                    "unsupported_aggregation_field",
                                                                    "unsupported_grouping_field",
                                                                    "unsupported_sorting_field",
                                                                    "unsupported_filter_field" };

        private static readonly string[] ReplaceClass_warnings = { "unsupported_start_object" };

        private static readonly string[] ReplaceReference_warnings = { "unsupported_display_field",
                                                                       "unsupported_aggregation_field",
                                                                       "unsupported_grouping_field",
                                                                       "unsupported_sorting_field",
                                                                       "unsupported_filter_field",
                                                                       "unsupported_jump"};

        private static readonly string[] ReplaceSublist_warnings = { "unsupported_jump" };
        private static readonly string[] ReplaceJump_warnings = { "unsupported_jump" };

        public static bool Maps(WarningFix inputContentFix, string warning)
        {
            switch (inputContentFix)
            {
                case WarningFix.ReplaceField:
                    return ReplaceFields_warnings.Contains(warning, StringComparer.InvariantCultureIgnoreCase);

                case WarningFix.ReplaceClass:
                    return ReplaceClass_warnings.Contains(warning, StringComparer.InvariantCultureIgnoreCase);

                case WarningFix.ReplaceReference:
                    return ReplaceReference_warnings.Contains(warning, StringComparer.InvariantCultureIgnoreCase);

                case WarningFix.ReplaceSublist:
                    return ReplaceSublist_warnings.Contains(warning, StringComparer.InvariantCultureIgnoreCase);
                
                case WarningFix.ReplaceJump:
                    return ReplaceJump_warnings.Contains(warning, StringComparer.InvariantCultureIgnoreCase);

                default:
                    return false;
            }
        }

        public static WarningFix GetWarningTypeEnum(string fix)
        {
            switch (fix.ToLowerInvariant())
            {
                case "replace field":
                    return WarningFix.ReplaceField;
                case "replace class":
                    return WarningFix.ReplaceClass;
                case "replace reference":
                    return WarningFix.ReplaceReference;
                case "replace sublist":
                    return WarningFix.ReplaceSublist;
                default:
                    return WarningFix.NotSupportedMethod;
            }
        }
    }
}