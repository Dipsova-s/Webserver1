using System;
using System.Diagnostics;
using System.Reflection;

namespace EveryAngle.ManagementConsole.Helpers
{
    public static class AssemblyInfoHelper
    {
        public static string GetFileVersion()
        {
            return GetFileVersion(Assembly.GetExecutingAssembly().Location);
        }

        public static string GetFileVersion(string executingFileLocation)
        {
            string versionNumber = string.Empty;
            try
            {
                versionNumber = FileVersionInfo.GetVersionInfo(executingFileLocation).FileVersion;
            }
            catch (Exception ex)
            {
                versionNumber = ex.Message;
            }
            return versionNumber;
        }
    }
}
