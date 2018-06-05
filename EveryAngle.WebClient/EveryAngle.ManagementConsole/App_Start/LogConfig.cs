using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using EveryAngle.Logging;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.LogHandlers;
using log4net.Appender;
using log4net.Config;
using EveryAngle.ManagementConsole.Helpers;

namespace EveryAngle.ManagementConsole.App_Start
{
    public class LogConfig
    {
        public static void Initial()
        {
            try
            {
                var logFolder = LogManager.GetLogPath(ConfigurationManager.AppSettings.Get("LogFileFolder"));
                var maxLogFileSize = (Convert.ToInt32(ConfigurationManager.AppSettings.Get("MaxLogFileSize")) / 1000);

                var maxLogFileNumber = Convert.ToInt32(ConfigurationManager.AppSettings.Get("MaxLogFileNumber"));
                Log.Initialize(logFolder, maxLogFileSize, maxLogFileNumber, Debugger.IsAttached, "EveryAngle_ManagementConsole");

            }
            catch (Exception ex)
            {
                WriteEventLog(ex.Message);
            }
        }

        public static void WriteEventLog(string eventText)
        {
            try
            {
                EventLog.WriteEntry("M4 Management Console", "Application" + ": " + eventText, EventLogEntryType.Warning, 1);
            }
            catch
            {
                // do nothing
            }
        }

        public static void InitialRequestLog(bool enabled)
        {
            if (enabled)
            {
                Profiler.Initialize();
                Log.SendInfo("Initial request and response log at {0}. " + DateTime.Now);
                var logPath = ConfigurationManager.AppSettings["LogFileFolder"];
                var dirInfo = new DirectoryInfo(logPath);
                if (dirInfo.Exists)
                {
                    XmlConfigurator.Configure();
                    var isBackSlash = logPath.EndsWith(@"\");
                    logPath = logPath + (isBackSlash ? "" : @"\");


                    logPath = logPath +
                              string.Format("EveryAngle_ManagementConsole_Request_Response_{0}_{1}_{2}.log",
                                  DateTime.Now.Year,
                                  DateTime.Now.Month, DateTime.Now.Day);


                    var repository = log4net.LogManager.GetRepository();

                    var appenders = repository.GetAppenders();

                    foreach (var appender in from iAppender in appenders
                                             where iAppender is FileAppender
                                             select iAppender)
                    {
                        var fileAppender = appender as FileAppender;
                        fileAppender.File = logPath;
                        fileAppender.ActivateOptions();
                    }
                }
            }
        }
    }
}
