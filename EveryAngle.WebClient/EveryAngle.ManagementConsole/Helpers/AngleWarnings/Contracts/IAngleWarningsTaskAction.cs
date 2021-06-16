using AngleWarnings;
using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IAngleWarningsTaskAction
    {
        string ActionType { get; set; }
        string Approval_state { get; }
        List<BaseArgument> Arguments { get; set; }
        string Notification { get; set; }
        string Run_as_user { get; set; }

        void AddActionArgument(string oldField, AngleWarningsContentInput contentInput, string startObject, string[] types);
        void AddTargetId(WarningFix warningFix, string angleId, string displayId);
    }
}