using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsFileReader
    {
        ActionResult ReturnReadExcelHeaderColumnResult(HttpPostedFileBase file);
        FileViewModel DownloadAngleWarningFile(string fullPath);
        List<string> ReadContentInputExcelFileFromDisk();
    }
}