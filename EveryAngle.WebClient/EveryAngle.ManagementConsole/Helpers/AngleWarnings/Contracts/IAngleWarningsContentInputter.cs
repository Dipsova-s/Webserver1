using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IAngleWarningsContentInputter
    {
        void Initialize(string fieldSourcesUri, string classesUri);
        ActionResult ReturnReadExcelHeaderColumnResult(HttpPostedFileBase file);
        FileViewModel DownloadAngleWarningFile(string fullPath);
        bool TryReadInputList();
        ItemSolver GetSolveItem(string warning, string objectClass, string field, string jump);
    }
}