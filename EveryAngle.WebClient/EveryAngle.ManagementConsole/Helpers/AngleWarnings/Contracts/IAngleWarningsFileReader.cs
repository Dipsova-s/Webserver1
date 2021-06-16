using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IAngleWarningsFileReader
    {
        List<string> ReadContentInputExcelFileFromDisk();
    }
}