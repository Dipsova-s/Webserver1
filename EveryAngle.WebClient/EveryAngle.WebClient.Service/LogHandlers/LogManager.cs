using EveryAngle.Logging;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace EveryAngle.WebClient.Service.LogHandlers
{
    #region LogManager

    public static class LogManager
    {
        #region Public Methods
        public static DataTable GenerateInfoTable(string method, string uri, IList<string> headers, IList<string> cookies, string body, string type)
        {
            DataTable requestInfo = new DataTable("Request Infomation");
            string[] columnNames = { "Name", "Value" };
            requestInfo.Columns.AddRange(columnNames.Select(c => new DataColumn(c)).ToArray());

            for (int loop = 0; loop < 7; loop++)
            {
                DataRow requestValue = requestInfo.NewRow();
                if (loop == 0)
                {
                    requestValue[0] = "Type";
                    requestValue[1] = type;
                }
                if (loop == 1)
                {
                    requestValue[0] = "Method";
                    requestValue[1] = method.ToString();
                }
                if (loop == 2)
                {
                    requestValue[0] = "URI";
                    requestValue[1] = uri;
                }
                if (loop == 3)
                {
                    requestValue[0] = "Headers";
                    requestValue[1] = string.Join(", ", headers);
                }
                if (loop == 4)
                {
                    requestValue[0] = "Cookies";
                    requestValue[1] = string.Join(", ", cookies);
                }
                if (loop == 5)
                {
                    requestValue[0] = "Body";
                    requestValue[1] = body;
                }

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
            string exMessage;

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
            string targetFolder;

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
                targetFolder = string.Format(@"~{0}", System.Configuration.ConfigurationManager.AppSettings.Get("LogFileFolder"));
            }

            return targetFolder;
        }
        public static string ParseBodyContentLogging(string url, string body, Method method)
        {
            if (body.Contains("authorization"))
            {
                body = "{\"authorization\":\"xxxxxxxxxxxxxxxxx\"}";
            }
            else if (method == Method.PUT &&
                url.Equals("password/changepassword"))
            {
                var separators = new List<string> { ":", "," };
                body = AnonymizeField("oldpassword", separators, body);
                body = AnonymizeField("newpassword", separators, body);
            }
            return body;
        }
        #endregion

        #region Private Methods
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
}
