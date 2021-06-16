using System.ComponentModel;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings.Enums
{
    public enum WarningSolution
    {
        [Description("replace_field")] ReplaceField,
        [Description("replace_start_object")] ReplaceStartObject,
        [Description("replace_jump")] ReplaceJump
    }
}