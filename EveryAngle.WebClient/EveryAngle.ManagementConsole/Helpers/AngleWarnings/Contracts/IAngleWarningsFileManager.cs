using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;
using System.IO;
using System.Web;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsFileManager
    {
        FileInfo UploadAngleWarningsFile(HttpPostedFileBase file, out bool isInvalid);
        FileViewModel DownloadAngleWarningsFile(string fullPath);
        List<string> ReadContentInputExcelFileFromDisk();
    }
}