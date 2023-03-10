using System;

namespace EveryAngle.OData.Utils.Logs
{
    public static class LogService
    {
        private static readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public static void Init()
        {
            Info(new string('-', 80));
            Info("Starting application..");
        }

        public static void Logs(LogLevel level, string message, Exception ex)
        {
            if (level == LogLevel.INFO)
                Info(message, ex);
            else if (level == LogLevel.WARN)
                Warn(message, ex);
            else if (level == LogLevel.ERROR)
                Error(message, ex);
        }

        public static void Error(string message)
        {
            logger.Error(message);
        }
        public static void Error(string message, Exception ex)
        {
            logger.Error(message, ex);
        }

        public static void Info(string message)
        {
            logger.Info(message);
        }
        public static void Info(string message, Exception ex)
        {
            logger.Info(message, ex);
        }

        public static void Warn(string message)
        {
            logger.Warn(message);
        }
        public static void Warn(string message, Exception ex)
        {
            logger.Warn(message, ex);
        }
    }
}
