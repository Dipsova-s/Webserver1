using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;
using System.IO;
using System.Web;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsFileManager
    {
        FileInfo ReadExcelHeaderColumnResult(HttpPostedFileBase file, out bool isInvalid);
        FileViewModel DownloadAngleWarningFile(string fullPath);
        List<string> ReadContentInputExcelFileFromDisk();
    }
}