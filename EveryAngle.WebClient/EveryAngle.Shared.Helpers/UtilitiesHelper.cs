using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Xml;

namespace EveryAngle.Shared.Helpers
{
    public static class UtilitiesHelper
    {
        public static string StripHTML(string stringText, bool isRemoveHeadingTag)
        {
            string result = Regex.Replace(stringText, @"\s{2,}", string.Empty);

            if (isRemoveHeadingTag)
            {
                result = Regex.Replace(result, @"(<\/(h\d)>)", "$1 ", RegexOptions.IgnoreCase);
                result = Regex.Replace(result, @"<h\d\b[^>]*>(.*?)<\/h\d>", string.Empty, RegexOptions.IgnoreCase);
            }

            result = Regex.Replace(result, @"(<\/(blockquote|tr|ol|ul|li|div|p|h\d)>)", "\r\n", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"(<ul[^>]*>)", "\r\n", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"(<(li|td)>)", "- ", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"(<\/[a-z]+>)", " ", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"<br ?\/?>", "\r\n", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"<hr ?\/?>", string.Empty, RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"<img[^>]*>", string.Empty, RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"<%", string.Empty, RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"%>", "\r\n", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"<!--", string.Empty, RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"-->", string.Empty, RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"&nbsp;", " ", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"</?\w+((\s+\w+(\s*=\s*(?:"".*?""|'.*?'|[^'"">\s]+))?)+\s*|\s*)/?>", string.Empty, RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"  ", " ", RegexOptions.IgnoreCase);

            return result.Trim();
        }

        public static string GetOffsetLimitQueryString(int page, int pagesize)
        {
            return String.Format("offset={0}&limit={1}", CalculateOffset(page, pagesize), pagesize);
        }

        public static string GetOffsetLimitQueryString(int page, int pagesize, string q)
        {
            string queryString = GetOffsetLimitQueryString(page, pagesize);

            if (!string.IsNullOrEmpty(q))
            {
                queryString += "&q=" + q.Trim();
            }
            return queryString;
        }

        public static int CalculateOffset(int page, int pagesize)
        {
            return (page - 1) * pagesize;
        }

        public static double ConvertBytesToGigabytes(double val)
        {
            return Math.Round((val / (1024 * 1024 * 1024)), 2);

        }

        public static bool IsJTokenNullOrEmpty(JToken token)
        {
            return (token == null) ||
                   (token.Type == JTokenType.Array && !token.HasValues) ||
                   (token.Type == JTokenType.Object && !token.HasValues) ||
                   (token.Type == JTokenType.String && token.ToString() == String.Empty) ||
                   (token.Type == JTokenType.Null);
        }

        public static string GetWebClientPath(string fileOrFolder = "")
        {
            Uri uri = new Uri(AppDomain.CurrentDomain.BaseDirectory);
            string parrantDir = uri.LocalPath.Remove(uri.LocalPath.Length - uri.Segments.Last().Length);
            string parentPath = Uri.UnescapeDataString(parrantDir);
            string fullFilePath = parentPath;
            string hostUri = System.Web.HttpContext.Current.Request.UrlReferrer == null ? "" : System.Web.HttpContext.Current.Request.UrlReferrer.AbsoluteUri;
            if (!hostUri.ToLowerInvariant().Contains("/admin/"))
            {
                fullFilePath += @"EveryAngle.WebClient.Web\";
            }
            fullFilePath += fileOrFolder;
            return fullFilePath;
        }

        public static string GetWebClientUrl(string fileOrFolder)
        {
            string rootPath = System.Web.HttpContext.Current.Request.ApplicationPath;
            rootPath = rootPath.ToLowerInvariant().Replace("/admin", "/");

            // Add trailing '/'
            if (!rootPath.EndsWith("/"))
                rootPath += "/";

            string path = fileOrFolder.Replace("//", "/").Replace("~", "").ToLowerInvariant();

            // Remove a leading '/'
            if (path.StartsWith("/"))
                path = path.Substring(1);

            return rootPath + path;
        }

        private const int EXECUTE_TIME = 300000;
        private static ExecuteJsonResult ExecuteFile(ExecuteParameters executeParameters)
        {
            ExecuteJsonResult result = new ExecuteJsonResult();
            try
            {
                using (Process exeProcess = Process.Start(executeParameters.CommandPath, executeParameters.Parameters))
                {
                    result.Success = exeProcess.WaitForExit(EXECUTE_TIME);
                    if (!result.Success)
                    {
                        result.ErrorMessage = "Timeout on generating the xml file";
                    }
                    if (!exeProcess.HasExited)
                    {
                        exeProcess.Kill();
                    }
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }

        public static string GetImageFormatString(string fileName)
        {
            string extension = Path.GetExtension(fileName);
            if (string.IsNullOrEmpty(extension))
                throw new ArgumentException(
                    string.Format("Unable to determine file extension for fileName: {0}", fileName));

            switch (extension.ToLowerInvariant())
            {
                case @".bmp":
                    return "image/bmp";

                case @".gif":
                    return "image/gif";

                case @".ico":
                    return "image/x-icon";

                case @".jpg":
                case @".jpeg":
                    return "image/jpeg";

                case @".png":
                    return "image/png";

                default:
                    throw new NotImplementedException();
            }
        }

        public static FileInfo FindHelpImage(Uri imageUri, string defaultFolderDataImages, string alterFolderDataImages, out MemoryStream ms)
        {
            var domainImage =
                new DirectoryInfo(defaultFolderDataImages).GetFiles(imageUri.Segments.Last(), SearchOption.AllDirectories)
                    .FirstOrDefault();
            if (domainImage == null)
            {
                domainImage =
                    new DirectoryInfo(alterFolderDataImages).GetFiles("image-not-found.png", SearchOption.AllDirectories)
                        .FirstOrDefault();
            }

            using (Image image = Image.FromFile(domainImage.FullName))
            {
                ms = new MemoryStream();
                image.Save(ms, GetImageFormat(domainImage.FullName));
                return domainImage;
            }
        }

        public static ImageFormat GetImageFormat(string fileName)
        {
            string extension = Path.GetExtension(fileName);
            if (string.IsNullOrEmpty(extension))
                throw new ArgumentException(
                    string.Format("Unable to determine file extension for fileName: {0}", fileName));

            switch (extension.ToLowerInvariant())
            {
                case @".bmp":
                    return ImageFormat.Bmp;

                case @".gif":
                    return ImageFormat.Gif;

                case @".ico":
                    return ImageFormat.Icon;

                case @".jpg":
                case @".jpeg":
                    return ImageFormat.Jpeg;

                case @".png":
                    return ImageFormat.Png;

                case @".tif":
                case @".tiff":
                    return ImageFormat.Tiff;

                case @".wmf":
                    return ImageFormat.Wmf;

                default:
                    throw new NotImplementedException();
            }
        }

        public static ExecuteJsonResult GetJsonFromCsl(ExecuteParameters executeParameters)
        {
            ExecuteJsonResult result = new ExecuteJsonResult();
            FileInfo hasFile = new FileInfo(executeParameters.ExecutePath.Replace(".csl", ".xml"));
            if (hasFile.Exists)
            {
                DateTime xmlModifiedTime = hasFile.LastWriteTime;
                DateTime cslModifiedTime = new FileInfo(executeParameters.ExecutePath).LastWriteTime;

                if (cslModifiedTime.Subtract(xmlModifiedTime).TotalSeconds > 0)
                {
                    result = ExecuteFile(executeParameters);
                }
                else
                {
                    result.Success = true;
                }

            }
            else
            {
                result = ExecuteFile(executeParameters);
            }

            if (result.Success)
            {
                FileInfo resultFile = new FileInfo(executeParameters.ExecutePath.Replace(".csl", ".xml"));
                if (resultFile.Exists)
                {
                    result.ResultPath = resultFile.FullName;
                    string xml = File.ReadAllText(result.ResultPath);

                    try
                    {
                        XmlDocument xmlDocument = new XmlDocument();
                        xml = xml.Replace("\x01", "");
                        xml = xml.Replace("\x04", "");
                        xmlDocument.LoadXml(xml);

                        List<string> filters = GetCslLogFilters(executeParameters);
                        string xpathFilter = GetCslLogPathFilter(filters);

                        var nodes = xmlDocument.SelectNodes($"/CodeSiteLog/Message{xpathFilter}");
                        int total = 0;
                        IList<JObject> resultToken = new List<JObject>();
                        if (nodes != null)
                        {
                            total = nodes.Count;
                            int indexTo = executeParameters.Offset + executeParameters.Limit;
                            for (int index = executeParameters.Offset; index < indexTo; index++)
                            {
                                if (nodes[index] != null)
                                {
                                    XmlNode lastChild = nodes[index].LastChild;
                                    if (lastChild.Name == "Details")
                                    {
                                        XmlNode newNode = xmlDocument.CreateNode(XmlNodeType.Element, "DetailsUri", null);
                                        newNode.InnerText = executeParameters.Uri + "/" + index.ToString();
                                        lastChild.ParentNode.InsertAfter(newNode, lastChild);
                                        lastChild.ParentNode.RemoveChild(lastChild);
                                    }
                                    else
                                    {
                                        XmlNode newNode = xmlDocument.CreateNode(XmlNodeType.Element, "DetailsUri", null);
                                        newNode.InnerText = executeParameters.Uri + "/" + index.ToString();
                                        lastChild.ParentNode.InsertAfter(newNode, lastChild);
                                    }

                                    JObject token = JObject.FromObject(GetCslLogDataRow(nodes[index]));
                                    resultToken.Add(token);
                                }
                            }
                        }

                        JObject output = JObject.FromObject(new
                        {
                            messages = resultToken,
                            header = new
                            {
                                total,
                                offset = executeParameters.Offset,
                                limit = executeParameters.Limit
                            }
                        });

                        result.Success = true;
                        result.Content = output;
                    }
                    catch (Exception ex)
                    {
                        result.Success = false;
                        result.ErrorMessage = ex.Message;
                    }
                }

            }
            return result;
        }

        private static List<string> GetCslLogFilters(ExecuteParameters executeParameters)
        {
            List<string> filters = new List<string>();
            if (!string.IsNullOrEmpty(executeParameters.Q))
            {
                filters.Add(string.Format("contains(translate(@ProcessID,'ABCDEFGHJIKLMNOPQRSTUVWXYZ', 'abcdefghjiklmnopqrstuvwxyz'),'{0}') or contains(translate(@ThreadName,'ABCDEFGHJIKLMNOPQRSTUVWXYZ', 'abcdefghjiklmnopqrstuvwxyz'),'{0}') or contains(translate(@MsgText,'ABCDEFGHJIKLMNOPQRSTUVWXYZ', 'abcdefghjiklmnopqrstuvwxyz'),'{0}')", executeParameters.Q.ToLowerInvariant()));
            }

            if (!string.IsNullOrEmpty(executeParameters.MessageType))
            {
                filters.Add(filters.Any()
                    ? string.Format("and @MsgType = '{0}'", executeParameters.MessageType)
                    : string.Format("@MsgType = '{0}'", executeParameters.MessageType));
            }
            return filters;
        }

        private static string GetCslLogPathFilter(List<string> filters)
        {
            string xpathFilter = string.Empty;
            if (filters.Any())
            {
                xpathFilter = "[" + string.Join(" ", filters) + "]";
            }
            return xpathFilter;
        }

        private static dynamic GetCslLogDataRow(XmlNode node)
        {
            return new
            {
                AppName = GetXmlElementInnerText(node["AppName"]),
                MsgType = GetXmlNodeAttributeInnerText(node, "MsgType"),
                Category = new
                {
                    Color = GetXmlElementAttributeInnerText(node["Category"], "Color"),
                    FontColor = GetXmlElementAttributeInnerText(node["Category"], "FontColor")
                },
                ComputerName = GetXmlElementInnerText(node["ComputerName"]),
                MsgContent = GetXmlNodeAttributeInnerText(node, "MsgContent"),
                MsgText = SplitMessageByNewLine(GetXmlNodeAttributeInnerText(node, "MsgText")),
                ProcessID = GetXmlElementInnerText(node["ProcessID"]),
                ThreadName = GetXmlElementInnerText(node["ThreadName"]),
                TimeStamp = new
                {
                    Date = node["TimeStamp"]?.GetAttribute("Date"),
                    Time = node["TimeStamp"]?.GetAttribute("Time")
                },
                TypeName = node["TypeName"]?.InnerText,
                DetailsUri = node["DetailsUri"]?.InnerText
            };
        }

        private static string GetXmlNodeAttributeInnerText(XmlNode node, string name)
        {
            return node.Attributes[name] == null ? string.Empty : node.Attributes[name].InnerText;
        }

        private static string GetXmlElementInnerText(XmlElement element)
        {
            return element == null ? string.Empty : element.InnerText;
        }

        private static string GetXmlElementAttributeInnerText(XmlElement element, string name)
        {
            return element == null ? string.Empty : element.GetAttribute(name);
        }

        private static string SplitMessageByNewLine(string source)
        {
            var result = source.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None);

            return result.Length > 0 ? result[0] : source;
        }
        public static ExecuteJsonResult GetDetailFromCsl(ExecuteParameters executeParameters)
        {
            ExecuteJsonResult result = new ExecuteJsonResult();
            FileInfo hasFile = new FileInfo(executeParameters.ExecutePath.Replace(".csl", ".xml"));
            if (hasFile.Exists)
            {
                result.Success = true;
            }
            else
            {
                result = ExecuteFile(executeParameters);
            }

            if (result.Success)
            {
                FileInfo resultFile = new FileInfo(executeParameters.ExecutePath.Replace(".csl", ".xml"));
                if (resultFile.Exists)
                {
                    result.ResultPath = resultFile.FullName;
                    string xml = File.ReadAllText(result.ResultPath);

                    try
                    {
                        XmlDocument xmlDocument = new XmlDocument();
                        xml = xml.Replace("\x01", "");
                        xmlDocument.LoadXml(xml);

                        List<string> filters = GetCslLogFilters(executeParameters);
                        string xpathFilter = GetCslLogPathFilter(filters);

                        var nodes = xmlDocument.SelectNodes($"/CodeSiteLog/Message{xpathFilter}");
                        if (nodes != null)
                        {
                            XmlNode node = nodes[int.Parse(executeParameters.DetailsId)];
                            XmlNode lastChild = node.LastChild;
                            string cslType = node.SelectSingleNode("TypeName") != null ? node.SelectSingleNode("TypeName").InnerText : "";
                            var resultText = "";
                            if (lastChild.Name == "Details")
                            {
                                if (cslType == "Table")
                                {
                                    string output = "<table id='customLogTable'>";
                                    XmlNodeList nodeList = lastChild.ChildNodes;
                                    int index = 0;
                                    int totalColumn = 0;
                                    foreach (XmlNode xn in nodeList)
                                    {
                                        if (index == 0)
                                        {
                                            string[] headerTable = xn.InnerText.Split('\t');
                                            totalColumn = headerTable.Length;
                                            string headerColumn = "";
                                            foreach (var headerItem in headerTable)
                                            {
                                                headerColumn = string.Format("{0}<th>{1}</th>", headerColumn, headerItem);
                                            }

                                            output = string.Format("{0}<thead><tr>{1}</tr></thead>", output, headerColumn);
                                        }
                                        else
                                        {
                                            string[] bodyTable = xn.InnerText.Split('\t');
                                            string bodyColumn = "";

                                            for (int i = 0; i < totalColumn; i++)
                                            {
                                                try
                                                {
                                                    if (bodyTable[i] != null)
                                                        bodyColumn = string.Format("{0}<td>{1}</td>", bodyColumn, bodyTable[i]);
                                                }
                                                catch (Exception)
                                                {
                                                    bodyColumn = string.Format("{0}<td></td>", bodyColumn);
                                                }
                                            }

                                            if (index == 1)
                                                output = string.Format("{0}<tbody>", output);

                                            output = string.Format("{0}<tr>{1}</tr>", output, bodyColumn);

                                        }

                                        index++;
                                    }
                                    output = string.Format("{0}</tbody></table>", output);
                                    resultText = output;
                                }
                                else
                                {
                                    string output = "<ul>";
                                    XmlNodeList nodeList = lastChild.ChildNodes;
                                    foreach (XmlNode xn in nodeList)
                                    {
                                        output = string.Format("{0}<li>{1}</li>", output, xn.InnerText);
                                    }
                                    output = string.Format("{0}</ul>", output);
                                    resultText = output;
                                }
                            }
                            else
                            {
                                resultText = GetXmlNodeAttributeInnerText(node, "MsgText");
                            }
                            result.Success = true;
                            result.StringContent = $"<pre>{resultText}</pre>";
                        }


                    }
                    catch (Exception ex)
                    {
                        result.Success = false;
                        result.ErrorMessage = ex.Message;
                    }

                }

            }
            return result;

        }

        public static bool IsValidJson(string strInput)
        {
            strInput = strInput.Trim();
            if ((strInput.StartsWith("{") && strInput.EndsWith("}")) || //For object
                (strInput.StartsWith("[") && strInput.EndsWith("]"))) //For array
            {
                try
                {
                    JToken.Parse(strInput);
                    return true;
                }
                catch
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        static readonly string[] SizeSuffixes = { "bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB" };
        public static string GetFileSizeInString(Int64 value)
        {
            if (value < 0)
            {
                return "-" + GetFileSizeInString(-value);
            }

            if (value == 0)
            {
                return "0.0 bytes";
            }

            int mag = (int)Math.Log(value, 1024);
            decimal adjustedSize = (decimal)value / (1L << (mag * 10));

            return string.Format("{0:n1} {1}", adjustedSize, SizeSuffixes[mag]);
        }
    }

    public class ExecuteParameters
    {
        public string ExecutePath { get; set; }
        public string CommandPath { get; set; }
        public string Parameters { get; set; }
        public string DetailsId { get; set; }
        public int Offset { get; set; }
        public int Limit { get; set; }
        public int Total { get; internal set; }
        public string Uri { get; set; }
        public string Q { get; set; }
        public string MessageType { get; set; }
    }

    public class ExecuteJsonResult
    {
        public bool Success
        {
            get;
            internal set;
        }

        public string ResultPath { get; internal set; }

        public string ErrorMessage { get; internal set; }

        public JObject Content { get; internal set; }

        public string StringContent { get; internal set; }

    }
}
