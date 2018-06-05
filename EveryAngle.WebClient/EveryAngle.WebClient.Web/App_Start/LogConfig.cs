using EveryAngle.Logging;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Web.Helpers;
using log4net.Appender;
using log4net.Repository;
using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace EveryAngle.WebClient.Web.App_Start
{
    public class LogConfig
    {
        public static void Initial()
        {
            try
            {
                string logFolder = LogManager.GetLogPath(ConfigurationManager.AppSettings.Get("LogFileFolder"));
                int maxLogFileSize = (Convert.ToInt32(ConfigurationManager.AppSettings.Get("MaxLogFileSize")) / 1000);
                int maxLogFileNumber = Convert.ToInt32(ConfigurationManager.AppSettings.Get("MaxLogFileNumber"));
              
                Log.Initialize(logFolder, maxLogFileSize, maxLogFileNumber, Debugger.IsAttached, "EveryAngle_WebClient");

                EventLog.WriteEntry("Application", "Application: " + DateTime.Now.ToString(), EventLogEntryType.Information, 1);
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
                EventLog.WriteEntry("M4 Web Client", "Application" + ": " + eventText, EventLogEntryType.Warning, 1);
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
                Log.SendInfo("Initial request and response log at {0}. " + DateTime.Now.ToString());
                string logPath = ConfigurationManager.AppSettings["LogFileFolder"].ToString();
                var dirInfo = new DirectoryInfo(logPath);
                if (dirInfo.Exists)
                {
                    log4net.Config.XmlConfigurator.Configure();
                    bool isBackSlash = logPath.EndsWith(@"\");
                    logPath = logPath + ((isBackSlash) ? "" : @"\");

                    logPath = logPath + string.Format("EveryAngle_WebClient_Request_Response_{0}_{1}_{2}.log", DateTime.Now.Year.ToString(),
                        DateTime.Now.Month.ToString(), DateTime.Now.Day.ToString());


                    ILoggerRepository repository = log4net.LogManager.GetRepository();

                    IAppender[] appenders = repository.GetAppenders();

                    foreach (IAppender appender in (from iAppender in appenders
                                                    where iAppender is FileAppender
                                                    select iAppender))
                    {
                        FileAppender fileAppender = appender as FileAppender;
                        fileAppender.File = logPath;
                        fileAppender.ActivateOptions();
                    }
                }
            }
        }


    }
}
