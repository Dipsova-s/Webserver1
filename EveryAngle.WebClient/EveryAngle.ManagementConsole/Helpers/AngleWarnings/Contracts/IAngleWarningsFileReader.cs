using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsFileReader
    {
        List<string> ReadContentExcelColumnHeaders(string file);
        List<string> ReadContentInputExcelFileFromDisk();
    }
}