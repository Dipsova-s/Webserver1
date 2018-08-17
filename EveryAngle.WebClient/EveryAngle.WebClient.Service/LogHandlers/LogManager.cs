using System.Text.RegularExpressions;
using EveryAngle.Shared.Helpers;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Hosting;
using RestSharp;
using EveryAngle.Logging;

[assembly: WebActivatorEx.PreApplicationStartMethod(
 typeof(EveryAngle.WebClient.Service.LogHandlers.LogManager), "Start")]
namespace EveryAngle.WebClient.Service.LogHandlers
{
    #region Enumerations
    public enum MsgLevelDFS : int
    {
        Summary = 3,
        Full = 4,
        Debug = 6
    }
    public enum MsgLevel : int
    {
        Exception = 0,// 3 csmRed     18h
        Error = 1,    // 3 csmError   2
        Warning = 2,  // 3 csmWarning 1
        //---
        Redirect = 3, // 6 csmBlue 1ch
        //---
        Info = 4,     // 3 csmInfo    0
        Full = 5,     // 4 csmYellow  1ah
        Debug = 6,    // 5 csmGreen   1bh
    }
    public enum LogSourceType : int
    {
        WebClient = 1,
        ManagementConsole = 2
    }
    public enum ExportType : int
    {
        Excel = 1,
        CSV = 2
    }
    public enum ProcessStatus : int
    {
        [DescriptionAttribute("Start")]
        Start = 1,
        [DescriptionAttribute("Pause")]
        Pause = 2,
        [DescriptionAttribute("Stop")]
        Stop = 3,
        [DescriptionAttribute("Success")]
        Success = 4,
        [DescriptionAttribute("Fail")]
        Fail = 5,
        [DescriptionAttribute("Ignore")]
        Ignore = 6
    }
    public enum DisplayType : int
    {
        [DescriptionAttribute("List")]
        List = 1,
        [DescriptionAttribute("Chart")]
        Chart = 2,
        [DescriptionAttribute("Pivot")]
        Pivot = 3
    }
    #endregion

    #region WorkItem
    public class WorkItem
    {
        #region Fields
        private static string appName;
        private static LogFileManager logFileManager;
        private static readonly object Lock = new object();
        #endregion

        #region Properties
        public static Dictionary<string, object> Arguments { get; set; }
        public static Action<Dictionary<string, object>> Callback { get; set; }
        #endregion

        #region Constructors
        public WorkItem(Dictionary<string, object> arguments, LogSourceType sourceType)
        {
        }
        #endregion

        #region Public Methods
        public static void Perform(LogFileManager logFileMG, string applicationName)
        {
            logFileManager = logFileMG;
            appName = applicationName;
            Callback(Arguments);
        }
        #endregion

        #region Private Methods
        private static void CheckLogFileMaxSizeExceeded()
        {
            if (logFileManager.CurrentLogFileSizeExceeded())
            {
                lock (Lock)
                {
                    logFileManager.CreateNewLogFile("Logging continued for {0} ({1})", appName, FileVersion);
                }
            }
        }

        private static string FileVersion
        {
            get
            {
                return AssemblyInfoHelper.GetFileVersionFromAssemblyName("EveryAngle.WebClient.Web"); ;
            }
        }

        private static void WriteEventLog(string message, string sourceType)
        {
            const string source = "Every Angle";
            string log = sourceType;

            if (!EventLog.SourceExists(source))
                EventLog.CreateEventSource(source, log);

            EventLog.WriteEntry(source, message);
            EventLog.WriteEntry(source, message, EventLogEntryType.Error);
        }

        private static string GetLogSourceType(LogSourceType logSourceType)
        {
            string result = string.Empty;

            switch (logSourceType)
            {
                case LogSourceType.WebClient:
                    result = "Web Client";
                    break;
                case LogSourceType.ManagementConsole:
                    result = "Management Console";
                    break;
                default:
                    break;
            }

            return result;
        }
        #endregion
    }
    #endregion

    #region LoggerThread
    public class LoggerThread
    {
        #region Fields

        private readonly object locker = new object();

        #endregion

        #region Public Methods
        
        public void Shutdown()
        {
        }

        public void EnqueueItem(WorkItem workItem)
        {
            lock (locker)
            {
                
            }
        }

        public void Run()
        {
        }
        #endregion
    }
    #endregion

    #region LogFileManager
    public class LogFileManager
    {
        #region Fields
        private const string fileExtension = ".csl";
        private readonly string logName;
        private readonly int logFileMaxBytes;
        private readonly int logFileMaxNumber;
        private readonly string logFolder;
        private string logFileCurrentName = String.Empty;
        private static readonly int[] Map = { 24, 2, 1, 28, 0, 26, 27 };
        #endregion

        #region Properties
        public int LogFileMaxBytes
        {
            get { return logFileMaxBytes; }
        }
        public int LogFileMaxNumber
        {
            get { return logFileMaxNumber; }
        }
        public string LogFileCurrentName
        {
            get { return logFileCurrentName; }
            set { logFileCurrentName = value; }
        }
        public string LogFolder
        {
            get { return logFolder; }
        }
        #endregion


        #region Public Methods
        public LogFileManager(string folder, int maxBytes, int maxNumber, string logName)
        {
            this.logName = logName;
            this.logFolder = folder;
            this.logFileMaxBytes = maxBytes;
            this.logFileMaxNumber = maxNumber;
        }

        public bool CurrentLogFileSizeExceeded()
        {
            bool output = false;
            string path = Path.Combine(this.LogFolder, this.LogFileCurrentName);
            FileInfo file = new FileInfo(path);
            if (!file.Exists)
                return false;
            if (file.Length > LogFileMaxBytes)
                output = true;
            return output;
        }

        public bool CurrentLogFileSizeExceeded(string name)
        {
            bool output = false;
            string path = Path.Combine(this.LogFolder, name);
            FileInfo file = new FileInfo(path);
            if (!file.Exists)
                return false;
            if (file.Length > LogFileMaxBytes)
                output = true;
            return output;
        }

        public void CreateNewLogFile()
        {
            CreateNewLogFile(null);
        }

        public bool IsLogFileExist()
        {
            DirectoryInfo folder = new DirectoryInfo(LogFolder);
            IOrderedEnumerable<FileInfo> logFiles = folder.GetFiles(logName + "*.csl").OrderBy(x => GetNr(x.Name));
            return logFiles.Count() > 0;
        }

        public void CreateNewLogFile(string format, params object[] args)
        {
            string logFileNameToCreate = CreateFileName(1);
            DirectoryInfo folder = new DirectoryInfo(LogFolder);
            IOrderedEnumerable<FileInfo> logFiles = folder.GetFiles(logName + "*.csl").OrderBy(x => GetNr(x.Name));
            if (logFiles.Count() >= LogFileMaxNumber)
            {
                foreach (FileInfo fi in logFiles.Skip(LogFileMaxNumber - 1))
                {
                    fi.Delete();
                }
            }
            logFiles = folder.GetFiles(logName + "*.csl").OrderBy(x => GetNr(x.Name));
            if (File.Exists(Path.Combine(LogFolder, logFileNameToCreate)))
            {
                foreach (FileInfo fi in logFiles.Reverse())
                {
                    int n = int.Parse(fi.Name.Replace(".csl", "").Substring(logName.Length));
                    fi.MoveTo(Path.Combine(LogFolder, CreateFileName(n + 1)));
                }
            }
            FileStream fs = null;
            try
            {
                string currentFileName = logFileNameToCreate;
                fs = File.Create(Path.Combine(LogFolder, currentFileName));
                logFileCurrentName = currentFileName;
            }
            finally
            {
                if (fs != null)
                {
                    fs.Dispose();
                }
            }
        }
        #endregion

        #region Private Methods
        public string CreateFileName(int ordinal)
        {
            return logName + ordinal + fileExtension;
        }

        private static int GetNr(string s)
        {
            int i = s.IndexOf('_') + 1;
            string t = s.Substring(i, s.IndexOf('.', i) - i);
            string number = Regex.Match(t, @"\d+").Value;
            return int.Parse(number);
        }
        #endregion
    }
    #endregion

    #region LogManager


    public static class LogManager
    {
        #region Fields
        private static readonly JobHost _jobHost = new JobHost();
        private static LoggerThread log = new LoggerThread();
        private static readonly object Lock = new object();
        private static readonly int[] Map = { 24, 2, 1, 28, 0, 26, 27 };
        private static string FileVersion
        {
            get
            {
                return AssemblyInfoHelper.GetFileVersion();
            }
        }
        #endregion

        public static void Start()
        {
            string logFolder =  System.Configuration.ConfigurationManager.AppSettings.Get("LogFileFolder");
            int maxLogFileSize = Convert.ToInt32(System.Configuration.ConfigurationManager.AppSettings.Get("MaxLogFileSize"));
            int maxLogFileNumber = Convert.ToInt32(System.Configuration.ConfigurationManager.AppSettings.Get("MaxLogFileNumber"));

            string targetFolder = string.Empty;

            if (Path.IsPathRooted(logFolder))
            {
                targetFolder = logFolder;
                if (!Directory.Exists(Path.GetFullPath(logFolder)))
                {
                    Directory.CreateDirectory(Path.GetFullPath(logFolder));
                }
            }
            else
            {
                targetFolder = String.Format(@"~{0}", System.Configuration.ConfigurationManager.AppSettings.Get("LogFileFolder"));
            }
            Init(targetFolder, maxLogFileSize, maxLogFileNumber, MsgLevelDFS.Debug, "M4WebClient_", "Web Client", LogSourceType.WebClient);
        }

        #region Public Methods
        private static void Init(string folder, int maxFileSizeBytes, int maxLogFileNumber, MsgLevelDFS messageLevelDFS, string logName, string appName, LogSourceType webType)
        {
        }
        public static void WriteError(string msg, Exception ex, LogSourceType sourceType)
        {
            string message = string.Empty;
            if (ex != null)
                message += " {0}";
            Write(MsgLevel.Error, message, sourceType, ex);

        }
        public static void WriteException(string msg, Exception ex, LogSourceType sourceType)
        {
            if (ex == null)
                Write(MsgLevel.Exception, msg, sourceType);
            else
                Write(MsgLevel.Exception, "{0} --- {1}", sourceType, ex.Message, ex.ToString());
        }
        public static void WriteExceptionStack(Exception exception, LogSourceType sourceType)
        {
            while (exception != null)
            {
                WriteError(exception.ToString(), exception, sourceType);
                exception = exception.InnerException;
            }
        }
        public static void Shutdown()
        {
            lock (Lock)
            {
                log.Shutdown();
            }
        }
        public static void WriteCollection(MsgLevel msgLevel, string msg, IEnumerable collection, LogSourceType sourceType)
        {
        }
        public static void WriteTable(MsgLevel msgLevel, string msg, DataTable table, LogSourceType sourceType)
        {
            
        }
        public static void Write(MsgLevel msgLevel, string format, LogSourceType sourceType, params object[] args)
        {
           
        }
        public static DataTable GenerateInfoTable(string method, string uri, IList<string> headers, IList<string> cookies, string body, string type)
        {
            DataTable requestInfo = new DataTable("Request Infomation");
            string[] columnNames = { "Name", "Value" };
            requestInfo.Columns.AddRange(columnNames.Select(c => new DataColumn(c)).ToArray());

            for (int loop = 0; loop < 7; loop++)
            {
                DataRow requestValue = requestInfo.NewRow();
                if (loop == 0) { requestValue[0] = "Type"; requestValue[1] = type; }
                if (loop == 1) { requestValue[0] = "Method"; requestValue[1] = method.ToString(); }
                if (loop == 2) { requestValue[0] = "URI"; requestValue[1] = uri; }
                if (loop == 3) { requestValue[0] = "Headers"; requestValue[1] = string.Join(", ", headers); }
                if (loop == 4) { requestValue[0] = "Cookies"; requestValue[1] = string.Join(", ", cookies); }
                if (loop == 5) { requestValue[0] = "Body"; requestValue[1] = body; }

                requestInfo.Rows.Add(requestValue);
            }

            return requestInfo;
        }
        public static void WriteLogRequestContent(Method method, string uri, IRestRequest request)
        {
            IList<string> cookies = GetHeaderParameters<IRestRequest>(request, ParameterType.Cookie);
            IList<string> headers = GetHeaderParameters<IRestRequest>(request, ParameterType.HttpHeader);
            string body = GetHeaderBody(request);
            
            DataTable requestInfo = LogManager.GenerateInfoTable(method.ToString(), uri, headers, cookies, body, "Request");
            Log.SendTable(LogMessageType.Green, string.Format("{0} => {1}", method.ToString(), uri), requestInfo);
        }
        public static void WriteLogResponseContent(Method method, string uri, IRestResponse currentResponseData)
        {
            IList<string> cookies = GetHeaderParameters<IRestResponse>(currentResponseData, ParameterType.Cookie);
            IList<string> headers = GetHeaderParameters<IRestResponse>(currentResponseData, ParameterType.HttpHeader);

            if (currentResponseData.StatusCode.GetHashCode() >= 200 && currentResponseData.StatusCode.GetHashCode() <= 299)
            {
                DataTable requestInfo = LogManager.GenerateInfoTable(method.ToString(), uri, headers, cookies, currentResponseData.Content, "Response");
                Log.SendTable(LogMessageType.Green, string.Format("{0} <= {1}", method.ToString(), uri), requestInfo);
            }
        }
        public static void WriteLogErrorResponse(Method method, string uri, IRestResponse currentResponseData, LogMessageType logMessageType)
        {
            IList<string> cookies = GetHeaderParameters<IRestResponse>(currentResponseData, ParameterType.Cookie);
            IList<string> headers = GetHeaderParameters<IRestResponse>(currentResponseData, ParameterType.HttpHeader);
            string body = currentResponseData.Content;

            foreach (var para in currentResponseData.Headers)
            {
                if (para.Type == ParameterType.Cookie)
                {
                    cookies.Add(para.Name + ": " + para.Value.ToString());
                }
                else if (para.Type == ParameterType.HttpHeader)
                {
                    headers.Add(para.Name + ": " + para.Value.ToString());
                }
            }

            DataTable requestInfo = LogManager.GenerateInfoTable(method.ToString(), uri, headers, cookies, body, "Response");
            Log.SendTable(logMessageType, string.Format("{0} <= {1}", method.ToString(), uri), requestInfo);
        }
        public static void WriteLogErrorResponse(Method method, string uri, IRestResponse currentResponseData)
        {
            IList<string> cookies = GetHeaderParameters<IRestResponse>(currentResponseData, ParameterType.Cookie);
            IList<string> headers = GetHeaderParameters<IRestResponse>(currentResponseData, ParameterType.HttpHeader);
            string body = currentResponseData.Content;

            foreach (var para in currentResponseData.Headers)
            {
                if (para.Type == ParameterType.Cookie)
                {
                    cookies.Add(para.Name + ": " + para.Value.ToString());
                }
                else if (para.Type == ParameterType.HttpHeader)
                {
                    headers.Add(para.Name + ": " + para.Value.ToString());
                }
            }

            DataTable requestInfo = LogManager.GenerateInfoTable(method.ToString(), uri, headers, cookies, body, "Response");
            Log.SendTable(LogMessageType.Red, string.Format("{0} <= {1}", method.ToString(), uri), requestInfo);
        }
        public static void WriteLogErrorResponse(HttpMethod method, string uri, HttpResponseMessage response, IList<string> ips)
        {
        }
        public static List<string> GetHeaderParameters<T>(T header, ParameterType parameterType)
        {
            List<string> results = new List<string>();
            try
            {
                if (header.GetType() == typeof(RestRequest))
                {
                    var paras = (IRestRequest)header;

                    foreach (var para in paras.Parameters)
                    {
                        if (para.Type == parameterType)
                        {
                            results.Add(para.Name + ": " + (para.Value==null? "" : para.Value.ToString()));
                        }
                    }
                }
                else if (header.GetType() == typeof(RestResponse))
                {
                    var paras = (IRestResponse)header;

                    foreach (var para in paras.Headers)
                    {
                        if (para.Type == parameterType)
                        {
                            results.Add(para.Name + ": " + para.Value.ToString());
                        }
                    }
                }
            }
            catch
            {
                return results;
            }

            return results;
        }
        public static string GetHeaderBody(IRestRequest request)
        {
            string body = string.Empty;

            foreach (var para in request.Parameters)
            {
                if (para.Type == ParameterType.RequestBody)
                {
                    body = para.Value.ToString();
                }
            }
            
            return ParseBodyContentLogging(request.Resource, body, request.Method);
        }
        public static void WriteExceptionLog(Exception ex)
        {
            string exMessage = string.Empty;

            if (ex.InnerException == null)
            {
                exMessage = ex.Message;
            }
            else
            {
                var baseEx = ex.GetBaseException();
                exMessage = baseEx.Message;
            }

            Log.SendException(exMessage, ex);
        }
        public static string GetLogPath(string logFolder)
        {
            string targetFolder = string.Empty;

            if (Path.IsPathRooted(logFolder))
            {
                targetFolder = logFolder;

                if (!Directory.Exists(Path.GetFullPath(logFolder)))
                {
                    Directory.CreateDirectory(Path.GetFullPath(logFolder));
                }
            }
            else
            {
                targetFolder = String.Format(@"~{0}", System.Configuration.ConfigurationManager.AppSettings.Get("LogFileFolder"));
            }

            return targetFolder;
        }
        public static string ParseBodyContentLogging(string url, string body, Method method)
        {
            if (body.Contains("authorization"))
            {
                body = "{\"authorization\":\"xxxxxxxxxxxxxxxxx\"}";
            }
            else if (Method.PUT == method &&
                "password/changepassword".Equals(url))
            {
                var separators = new List<string> { ":", "," };
                body = AnonymizeField("oldpassword", separators, body);
                body = AnonymizeField("newpassword", separators, body);
            }
            return body;
        }
        #endregion

        #region Private Methods
        private static void WriteEventLog(string message, string sourceType)
        {
            const string source = "Every Angle";
            string logName = sourceType;

            if (!EventLog.SourceExists(source))
                EventLog.CreateEventSource(source, logName);

            EventLog.WriteEntry(source, message);
            EventLog.WriteEntry(source, message, EventLogEntryType.Error);
        }
        private static string GetLogSourceType(LogSourceType logSourceType)
        {
            string result = string.Empty;

            switch (logSourceType)
            {
                case LogSourceType.WebClient:
                    result = "Web Client";
                    break;
                case LogSourceType.ManagementConsole:
                    result = "Management Console";
                    break;
                default:
                    break;
            }

            return result;
        }
        private static string AnonymizeField(string fieldName, IEnumerable<string> fieldSeparators, string input)
        {
            if (input.Contains(fieldName))
            {
                const string findExpression = "\"{0}\"\\s*?{1}\\s*?\"[^>]*?\"";
                const string replaceExpression = "\"{0}\"{1}\"********\"";
                string output = input;

                foreach (string fieldSeparator in fieldSeparators)
                {
                    var find = string.Format(findExpression, fieldName, fieldSeparator);
                    var replace = string.Format(replaceExpression, fieldName, fieldSeparator);

                    output = Regex.Replace(output, find, replace, RegexOptions.IgnoreCase);
                }
                return output;
            }
            return input;
        }
        #endregion
    }
    #endregion

    #region LogUtilities
    public static class LogUtilities
    {
        #region Public Methods
        public static string CreateIncomingRequestMessage(HttpRequestMessage request, int sessionId, string newLine)
        {
            return String.Format("[{0}] -> {1} {2}: {3}", sessionId, request.Method, FormatUri(request), newLine);
        }
        public static string CreateSessionIncomingRequestMessage(HttpRequestMessage request, int sessionId, string userId, string ipAddresses, string securityToken, DateTime expiresOn)
        {
            return String.Format("[{0}] -> {1} {2}: (User: {3}, ip: {4}, token: {5}, expires: {6})", sessionId, request.Method, FormatUri(request), userId, ipAddresses, securityToken, FormatDateTime(expiresOn));
        }
        public static string CreateOutGoingResponseMessage(HttpResponseMessage response, HttpRequestMessage request, int sessionId, string newLine)
        {
            return String.Format("[{0}] <- {1} {2}: {3} {4}: {5}",
                sessionId,
                response.StatusCode.GetHashCode(),
                response.ReasonPhrase.ToUpper(),
                request.Method,
                FormatUri(request),
                newLine);
        }
        public static string CreatePostToModelServerMessage(string queryUri)
        {
            return String.Format("<= {0} {1} (POST {2})", HttpStatusCode.Created.GetHashCode(), HttpStatusCode.Created.ToString().ToUpper(), queryUri);
        }
        public static string CreateSecurityTokenMissingOrInvalidMessage(HttpRequestMessage request, string message)
        {
            return String.Format("-> {0} {1}: {2}....", request.Method, FormatUri(request), message);
        }
        public static string CreateGetQueryResultMessage(Uri queryUri, bool isCompleted, bool isGetQueryResultData)
        {
            string output = String.Format("=> GET {0}.", queryUri);
            string dataString = "GET from";
            if (isCompleted)
            {
                if (isGetQueryResultData)
                    dataString = "GET data from";

                output = String.Format("<= {0} {1} ({2} {3})", HttpStatusCode.OK.GetHashCode(), HttpStatusCode.OK, dataString, queryUri);
            }

            return output;
        }
        public static string CreateSessionExpirationMessage(string sessionId, string userFullName, TimeSpan duration)
        {
            string totalTime = string.Format("{0}:{1}", (int)(duration.TotalMinutes / 60), (int)(duration.TotalMinutes % 60));
            return String.Format("Session [{0}] expired for user: {1} (Active: {2} H)", sessionId, userFullName, totalTime);
        }
        public static string CreateSolrNotAvailableMessage()
        {
            return "SOLR is not available.";
        }
        public static string CreateModelServerNotAvailableMessage(string id, string uri, string status)
        {
            return String.Format("Model server (ID: {0}, URI: {1} ); Status: {2}.", id, uri, status);
        }
        public static string CreateQueryResultNotFoundMessage(string resultBusinessId, string modelServerBusinessId, string uri, string status)
        {
            return String.Format("Result {0} not found at Model server (ID: {1}, URI: {2} ); Status: {3}.", resultBusinessId, modelServerBusinessId, uri, status);
        }
        public static string CreateWaitSecMessage()
        {
            return "Please try again in a few seconds.";
        }
        public static string FormatDateTime(DateTime dateTime)
        {
            string output = String.Empty;
            if (dateTime != DateTime.MinValue)
                output = String.Format("{0}", dateTime.ToLocalTime().ToString("yyyy/M/d HH:mm:ss"));

            return output;
        }
        public static string GenerateStartExportMessage(DisplayType displayType, HttpContextBase httpContextBase = null, HttpRequestMessage request = null)
        {
            string result = string.Empty;
            string method = httpContextBase != null ? httpContextBase.Request.HttpMethod : request.Method.Method;
            string url = httpContextBase != null ? httpContextBase.Request.Url.AbsoluteUri : request.RequestUri.AbsoluteUri;
            result = String.Format("-> {0} {1}: {2}", method, url, EnumHelper.StringValueOf(ProcessStatus.Start) + " export to excel from " + EnumHelper.StringValueOf(displayType).ToLower());

            return result;
        }
        public static string GenerateSuccessExportMessage(DisplayType displayType, HttpContextBase httpContextBase = null, HttpRequestMessage request = null, HttpResponseMessage response = null)
        {
            string result = string.Empty;
            string method = httpContextBase != null ? httpContextBase.Request.HttpMethod : request.Method.Method;
            string url = httpContextBase != null ? httpContextBase.Request.Url.AbsoluteUri : request.RequestUri.AbsoluteUri;
            int statusCode = httpContextBase != null ? httpContextBase.Response.StatusCode : response.StatusCode.GetHashCode();
            string description = httpContextBase != null ? httpContextBase.Response.StatusDescription : response.ReasonPhrase;
            result = String.Format("<- {0} {1}: {2} {3}: {4}", statusCode, description, method, url, EnumHelper.StringValueOf(ProcessStatus.Success) + " export to excel from " + EnumHelper.StringValueOf(displayType).ToLower());

            return result;
        }
        public static string GenerateRequestMessage(string method, string url, string message)
        {
            return string.Format("-> {0} {1}: {2}", method, url, message);
        }
        public static string GenerateResponseMessage(int statusCode, string statusText, string method, string url, string message)
        {
            return string.Format("<- {0} {1}: {2} {3}: {4}", statusCode, statusText, method, url, message);
        }
        #endregion

        #region Private Methods
        private static string FormatUri(HttpRequestMessage request)
        {
            return String.Format(":{0}{1}", request.RequestUri.Port, request.RequestUri.PathAndQuery);
        }
        #endregion
    }

    public class JobHost : IRegisteredObject
    {
        private readonly object _lock = new object();
        private bool _shuttingDown;

        public JobHost()
        {
            HostingEnvironment.RegisterObject(this);
        }

        public void Stop(bool immediate)
        {
            lock (_lock)
            {
                _shuttingDown = true;
            }
            HostingEnvironment.UnregisterObject(this);
        }

        public void DoWork(Action work)
        {
            lock (_lock)
            {
                if (_shuttingDown)
                {
                    return;
                }
                work();
            }
        }

        public void Finished()
        {
            HostingEnvironment.UnregisterObject(this);
        }

    }
    #endregion
}
