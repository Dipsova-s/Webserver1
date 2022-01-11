using System.Data;
using System.IO;

namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IFileHelper
    {
        bool FileExists(string file);
        DataTable ReadExcelColumnHeaders(string filePath, string sheetName);
        DataTable ReadExcel(string filePath, string sheetName, int headerRow);
    }
}