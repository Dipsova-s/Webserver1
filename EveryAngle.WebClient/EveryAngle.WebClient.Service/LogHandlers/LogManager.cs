using EveryAngle.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
                            results.Add(para.Name + ": " + (para.Value == null ? "" : para.Value.ToString()));
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

            return ParseBodyContentLogging(request.Resource, body, request.Method, true);
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

        public static string ParseBodyContentLogging(string url, string body, Method method, bool indented)
        {
            string loggingBody = body;

            if (string.IsNullOrEmpty(loggingBody)
                || !(method == Method.POST || method == Method.PUT))
            {
                return loggingBody;
            }

            // Some json documents are structured in an key/values structure, these will be handled differently.
            if (LoggerHelper.UrlsHavingSettingsList().Any(url.Contains))
            {
                if (LoggerHelper.TryGetMaskedSettingsJson(body, "setting_list", "id", out loggingBody, indented, LoggerHelper.GetPasswordIdsInSettings()))
                {
                    return loggingBody;
                }
            }
            else if (LoggerHelper.UrlsHavingArgumentsList().Any(url.Contains))
            {
                if (LoggerHelper.TryGetMaskedSettingsJson(body, "arguments", "name",out loggingBody, indented, LoggerHelper.GetPasswordNamesInArguments()))
                {
                    return loggingBody;
                }
            }
            else
            {
                if (LoggerHelper.TryGetMaskedJson(body, out loggingBody, indented, LoggerHelper.GetKnownPasswordPropertyNames()))
                {
                    return loggingBody;
                }
            }

            return $"Unable to parse body: {method} {url}";
        }
        #endregion

        internal static class LoggerHelper
        {
            private const string MASKING_CHARACTERS = "********************";

            public static string[] GetPasswordIdsInSettings()
            {
                return new string[] { "sap_password", "copy_smb_password", "copy_ftp_password", "sap_ddb_password", "connection_password", "database_manager_connection_string", "odbc_connection_string" };
            }

            public static string[] GetKnownPasswordPropertyNames()
            {
                return new string[] { "authorization", "oldpassword", "newpassword", "smtp_password" };
            }

            public static string[] GetPasswordNamesInArguments()
            {
                return new string[] { "password" };
            }

            public static string[] UrlsHavingSettingsList()
            {
                return new string[] { "/agent/download_settings", "/agent/modelserver_settings", "/system/datastores", "/check_connection" };
            }

            public static string[] UrlsHavingArgumentsList()
            {
                return new string[] { "/tasks" };
            }

            public static bool TryGetMaskedJson(string json, out string maskedJson, bool indented, params string[] propertiesToMask)
            {
                maskedJson = null;

                if (!IsValidForMasking(json, propertiesToMask))
                {
                    return false;
                }

                try
                {
                    maskedJson = GetMaskedJson(json, indented, propertiesToMask);
                    return true;
                }
                catch
                {
                    return false;
                }
            }

            public static bool TryGetMaskedSettingsJson(string json, string settingsSectionName, string findByProperty, out string maskedSettingsJson, bool indented, params string[] settingsToMask)
            {
                maskedSettingsJson = null;

                if (!IsValidForMasking(json, settingsToMask))
                {
                    return false;
                }

                try
                {
                    maskedSettingsJson = GetMaskedSettings(json, settingsSectionName, findByProperty, indented, settingsToMask);
                    return true;
                }
                catch
                {
                    return false;
                }
            }

            private static Dictionary<string, string[]> GetOptionsForSubstringMasking()
            {
                // settingId: FindExpression, ReplaceExpression
                return new Dictionary<string, string[]>
                {
                    { "database_manager_connection_string", new string[] { "(Password=)[^;>]*", "$1" + MASKING_CHARACTERS } },
                    { "odbc_connection_string", new string[] { "(Password=|Pwd=)[^;>]*", "$1" + MASKING_CHARACTERS } }
                };
            }

            private static bool IsValidForMasking(string json, params string[] maskingFields)
            {
                return !string.IsNullOrEmpty(json) && maskingFields != null && maskingFields.Any();
            }

            private static string GetMaskedSettings(string json, string settingsSectionName, string findByProperty, bool indented, params string[] settingsToMask)
            {
                var substringMaskingOptions = GetOptionsForSubstringMasking();
                var templateSettings = JToken.Parse(json);

                // based on the TemplateSettings json structure
                var settingList = FindMatchingTokens(templateSettings, settingsSectionName);

                var settings = settingList?.Children();

                var matchingSettings = settings?.Where(o => o[findByProperty] != null &&
                    settingsToMask.Contains(o[findByProperty].ToString(), StringComparer.OrdinalIgnoreCase));

                if (!matchingSettings.Any())
                {
                    return json;
                }

                foreach (var matchingSetting in matchingSettings)
                {
                    if (substringMaskingOptions.ContainsKey(matchingSetting[findByProperty].ToString()))
                    {
                        string id = matchingSetting[findByProperty].ToString();
                        string value = matchingSetting["value"].ToString();

                        string findExpression = substringMaskingOptions[id][0];
                        string replaceExpression = substringMaskingOptions[id][1];

                        string maskedValue = Regex.Replace(value, findExpression, replaceExpression, RegexOptions.IgnoreCase);

                        matchingSetting["value"] = maskedValue;
                    }
                    else
                    {
                        matchingSetting["value"] = MASKING_CHARACTERS;
                    }
                }

                return JsonConvert.SerializeObject(templateSettings,
                    indented ? Formatting.Indented : Formatting.None);
            }

            private static string GetMaskedJson(string json, bool indented, params string[] propertiesToMask)
            {
                var token = JToken.Parse(json);

                var matchingTokens = FindMatchingTokens(token, propertiesToMask);

                foreach (var matchingToken in matchingTokens)
                {
                    matchingToken.Replace(new JValue(MASKING_CHARACTERS));
                }

                return JsonConvert.SerializeObject(token, indented ? Formatting.Indented : Formatting.None);
            }

            private static IList<JToken> FindMatchingTokens(JToken containerToken, params string[] names)
            {
                var foundTokens = new List<JToken>();

                if (!names.Any())
                {
                    return foundTokens;
                }

                if (containerToken.Type != JTokenType.Object)
                {
                    if (containerToken.Type != JTokenType.Array)
                    {
                        return foundTokens;
                    }

                    foreach (var child in containerToken.Children())
                    {
                        foundTokens.AddRange(FindMatchingTokens(child, names));
                    }
                }
                else
                {
                    foreach (var child in containerToken.Children<JProperty>())
                    {
                        if (names.Contains(child.Name, StringComparer.OrdinalIgnoreCase))
                        {
                            foundTokens.Add(child.Value);
                        }

                        foundTokens.AddRange(FindMatchingTokens(child.Value, names));
                    }
                }

                return foundTokens;
            }
        }
    }
    #endregion
}
