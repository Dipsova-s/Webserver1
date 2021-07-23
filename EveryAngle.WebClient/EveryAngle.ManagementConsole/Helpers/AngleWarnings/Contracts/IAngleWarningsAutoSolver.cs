using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsAutoSolver
    {
        void Initialize(SessionHelper sessionHelper);
        string ExecuteAngleWarningsUsingInputFile(string modelId);
        int GetNumberOfSolvableFieldsViaInputFile(DataSourceResult dataSource);
    }
}