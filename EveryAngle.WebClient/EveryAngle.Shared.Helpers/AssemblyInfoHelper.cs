using System;
using System.Diagnostics;
using System.Reflection;

namespace EveryAngle.Shared.Helpers
{
    public static class AssemblyInfoHelper
    {
        public static string GetFileVersion()
        {
            string versionNumber = string.Empty;
            try
            {
                string executingFileLocation = Assembly.GetExecutingAssembly().Location;
                FileVersionInfo fileVersion = FileVersionInfo.GetVersionInfo(executingFileLocation);
                versionNumber = fileVersion.FileVersion;
            }
            catch (Exception ex)
            {
                versionNumber = ex.Message;
            }
            return versionNumber;
        }

        public static string GetFileVersionFromAssemblyName(string assemlyName)
        {
            string versionNumber = string.Empty;
            try
            {
                string executingFileLocation = Assembly.Load(assemlyName).Location;
                FileVersionInfo fileVersion = FileVersionInfo.GetVersionInfo(executingFileLocation);
                versionNumber = fileVersion.FileVersion;
            }
            catch (Exception ex)
            {
                versionNumber = ex.Message;
            }
            return versionNumber;
        }
    }
}
