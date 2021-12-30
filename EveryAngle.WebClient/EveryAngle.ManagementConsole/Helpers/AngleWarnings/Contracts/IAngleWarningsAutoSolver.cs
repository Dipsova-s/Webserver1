using EveryAngle.Core.ViewModels.Model;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsAutoSolver
    {
        void Initialize(SessionHelper sessionHelper);
        string ExecuteAngleWarningsUsingInputFile(string modelId);
        ActionResult ReadExcelHeaderColumnResult(HttpPostedFileBase file);
        FileViewModel GetDownloadAngleWarningFile(string fullPath);
        int GetNumberOfSolvableFieldsViaInputFile(DataSourceResult dataSource, out int hasAutomationTasks);
        List<AngleWarningThirdLevelViewmodel> GetLevel3Warnings(AngleWarningSecondLevelViewmodel level2AngleWarning);

        bool AreSomeAnglesPartOfAutomationTasks();
    }
}