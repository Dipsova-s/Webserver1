using EveryAngle.Core.ViewModels.Model;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsAutoSolver
    {
        void Initialize(AuthorizationHelper sessionHelper);
        string ExecuteAngleWarningsUsingInputFile(string modelId);
        int GetNumberOfSolvableFieldsViaInputFile(DataSourceResult dataSource, out int hasAutomationTasks);
        List<AngleWarningThirdLevelViewmodel> GetLevel3Warnings(AngleWarningSecondLevelViewmodel level2AngleWarning);

        bool AreSomeAnglesPartOfAutomationTasks();
    }
}