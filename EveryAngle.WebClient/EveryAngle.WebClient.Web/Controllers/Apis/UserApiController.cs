using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Web;
using EveryAngle.Core.ViewModels.Angle;
using System.Text.RegularExpressions;
using System.Web.Mvc;
using System.Drawing;
using System.Reflection;
using EveryAngle.WebClient.Web.Helpers;
using EveryAngle.Core.ViewModels.VideoPlayer;

namespace EveryAngle.WebClient.Web.Controllers.Apis
{
    public class UserApiController : BaseApiController
    {
        [HttpGet]
        public HttpResponseMessage GetVideos(string lang)
        {
            string userLanguage = lang ?? VideoHelper.VideoDefaultLanguage;
            string videoDirectory = string.Empty;
            string videoServerPath = HttpContext.Current.Server.MapPath(@"~" + VideoHelper.VideoResourcePath + userLanguage).ToLowerInvariant();
            string videoWebPath = (HttpContext.Current.Request.ApplicationPath + @"" + VideoHelper.VideoResourcePath + userLanguage).Replace("//", "/");

            VideoHelper.TryParseVideoDirectory(videoServerPath, userLanguage, out videoDirectory);
            IList<VideoPlayList> videosPlayList = VideoHelper.GetAllVideoPlayList(videoDirectory, videoWebPath);
            JArray videosPlayListAsJArray = JArray.FromObject(videosPlayList);

            return HttpResponseMessageBuilder.GetHttpResponseMessageFromArray(this, videosPlayListAsJArray);
        }

        [HttpGet]
        public HttpResponseMessage GetCreateNewAngleBySchema()
        {
            List<AngleSchemaResource> angleSchema = GetSchemaResources();
            JArray schema = JArray.FromObject(angleSchema);

            // restructure Detail property (JSON -> Array)
            List<string> properties = new List<string>();
            foreach (PropertyInfo prop in typeof(AreaCoordinate).GetProperties())
                properties.Add(prop.Name);

            foreach (JToken result in schema)
            {
                List<List<dynamic>> newDetails = new List<List<dynamic>>();
                foreach (var detail in result.SelectToken("Details").ToList())
                {
                    List<dynamic> newDetail = new List<dynamic>();
                    foreach (var propName in properties)
                    {
                        if (propName == "AreaStyle")
                        {
                            JObject newAreaStyle = new JObject();
                            foreach (JProperty areaStyle in detail[propName])
                            {
                                string value = areaStyle.Value.ToString();
                                if (!string.IsNullOrEmpty(value))
                                    newAreaStyle[areaStyle.Name] = value;
                            }
                            newDetail.Add(newAreaStyle);
                        }
                        else
                        {
                            newDetail.Add(detail[propName]);
                        }
                    }
                    newDetails.Add(newDetail);
                }
                result["Details"] = JArray.FromObject(newDetails);
                result["DetailFields"] = JArray.FromObject(properties);
            }

            return HttpResponseMessageBuilder.GetHttpResponseMessageFromArray(this, schema);
        }

        private List<AngleSchemaResource> GetSchemaResources()
        {
            string directoryPath = HttpContext.Current.Server.MapPath(@"~/Resources/CreateNewAngleBySchema/");
            string imageDefaultPath = @"/Resources/CreateNewAngleBySchema/Images/";
            List<AngleSchemaResource> schema = new List<AngleSchemaResource>();
            string[] models = System.IO.Directory.GetDirectories(directoryPath);
            string[] defaultFiles = System.IO.Directory.GetFiles(directoryPath, "*.ini");

            foreach (string model in models)
            {
                string folderName = Path.GetFileName(model);
                string modelImagePath = @"/Resources/CreateNewAngleBySchema/" + folderName + "/Images/";
                if (folderName.ToLowerInvariant() != "images")
                {
                    string[] modelConfigurations = System.IO.Directory.GetFiles(model, "*.ini");
                    SetCoordinate(modelImagePath, schema, modelConfigurations, folderName);
                }
            }


            SetCoordinate(imageDefaultPath, schema, defaultFiles, string.Empty);

            return schema;
        }

        private void SetCoordinate(string imageDefaultPath, List<AngleSchemaResource> schema, string[] defaultFiles, string modelName)
        {
            foreach (string file in defaultFiles)
            {
                try
                {
                    var fileContents = System.IO.File.ReadLines(file);
                    AngleSchemaResource sce = new AngleSchemaResource();
                    sce.Key = Path.GetFileNameWithoutExtension(file);
                    sce.ModelName = modelName;
                    schema.Add(sce);
                    foreach (string line in fileContents)
                    {
                        string rec = line.Trim().ToLowerInvariant();

                        if (rec.IndexOf(';') == 0)
                        {
                            // do nothing
                        }
                        else if (rec.IndexOf("textid", StringComparison.InvariantCulture) == 0)
                        {
                            string[] values = rec.Split('=');
                            if (values.Length > 1)
                                sce.DefaultHelp = values[1].Trim();
                        }
                        else if (rec.IndexOf("imagefile", StringComparison.InvariantCulture) == 0)
                        {
                            string path = HttpContext.Current.Request.ApplicationPath + imageDefaultPath + rec.Split('=')[1].Trim();
                            schema[schema.Count - 1].Picture = path;
                        }
                        else if (!string.IsNullOrEmpty(rec)
                            && rec.IndexOf('[') == -1
                            && rec.LastIndexOf(']') == -1
                            && !rec.Contains("[areas]"))
                        {
                            //value
                            if (schema[schema.Count - 1].Details == null)
                                schema[schema.Count - 1].Details = new List<AreaCoordinate>();

                            string[] values = rec.Split(';');
                            schema[schema.Count - 1].Details.Add(GetAreaCoordinate(values));
                        }
                    }

                    //restructure parents
                    SetParent(schema);
                }
                catch
                {
                    // do nothing
                }
            }
        }

        private AreaCoordinate GetAreaCoordinate(string[] values)
        {
            Regex regex = new Regex(@"^[a-zA-Z_][A-Za-z0-9_]*$");
            AreaCoordinate detail = new AreaCoordinate();
            detail.Coordinate = new List<int>();

            detail.Name = values[0].Trim().Split('=')[0].Trim();
            string[] coordinate = values[0].Trim().Split('=')[1].Trim().Split(',');

            foreach (string coor in coordinate)
                detail.Coordinate.Add(Convert.ToInt32(coor.Trim()));

            if (!string.IsNullOrEmpty(values[1].Trim()))
            {
                string className = values[1].Trim();
                detail.ClassId = className.Contains(":") ? className.Split(':')[0].Trim() : className;
            }

            detail.TemplateId = values[2].Trim();
            detail.IsValidTemplateId = regex.IsMatch(detail.TemplateId);
            detail.IsValidHelptextId = regex.IsMatch(detail.ClassId);
            detail.AreaStyle = GetAreaStyle(values);
            detail.AreaType = GetAreaType(values);

            if (values.Length > 5 && !string.IsNullOrEmpty(values[5]))
                detail.Label = values[5];

            return detail;
        }

        private Style GetAreaStyle(string[] values)
        {
            Style style = new Style();
            Dictionary<string, Action<Style, string>> actions = new Dictionary<string, Action<Style, string>>
            {
                { "text-align", (Style setting, string value) => { setting.TextAlignment = GetTextAlignment(value);  } },
                { "vertical-align", (Style setting, string value) => { setting.VerticalAlignment = GetVerticalAlignment(value);  } },
                { "font-weight", (Style setting, string value) => { setting.FontWeight = GetFontWeight(value);  } },
                { "font-size", (Style setting, string value) => { setting.FontSize = GetFontSize(value);  } },
                { "text-color", (Style setting, string value) => { setting.TextColor = GetColorCode(value);  } },
                { "text-version", (Style setting, string value) => { setting.TextSize = GetTextSize(value);  } },
                { "border-color", (Style setting, string value) => { setting.BorderColor = GetColorCode(value);  } },
                { "text-shadow", (Style setting, string value) => { setting.TextShadow = value;  } },
                { "padding", (Style setting, string value) => { setting.Padding = value;  } }
            };

            if (values.Length > 3)
            {
                string[] styles = values[3].Split(',');

                foreach (string settings in styles)
                {
                    string[] css = settings.Split(':');
                    if (css.Length == 2)
                    {
                        string styleKey = css[0].Trim().ToLowerInvariant();
                        string styleValue = css[1].Trim().ToLowerInvariant();
                        if (actions.ContainsKey(styleKey))
                            actions[styleKey](style, styleValue);
                    }
                }
            }
            return style;
        }

        private string GetAreaType(string[] values)
        {
            Dictionary<string, string> areaTyps = new Dictionary<string, string>
            {
                { "buttonarea", "ButtonArea" },
                { "subarea", "SubArea" },
                { "button", "Button" },
                { "legend", "Legend" },
                { "contextarea", "ContextArea" },
                { "ea_color_darkblue", "#00537a" },
                { "ea_color_darkbrown", "#443528" },
                { "ea_color_lightgrey", "#a6a6a1" },
                { "ea_color_white", "#ffffff" }
            };
            string areaType = string.Empty;

            if (values.Length > 4 && !string.IsNullOrEmpty(values[4]))
            {
                string styleValue = values[4].ToLowerInvariant().Trim();
                if (areaTyps.ContainsKey(styleValue))
                    areaType = areaTyps[styleValue];
            }
            return areaType;
        }

        private string GetColorCode(string styleValue)
        {
            Dictionary<string, string> colors = new Dictionary<string, string>
            {
                { "ea_color_green", "#008e91" },
                { "ea_color_lightblue", "#bedde9" },
                { "ea_color_orange", "#bedde9" },
                { "ea_color_yellow", "#ee0200" },
                { "ea_color_pruplegrey", "#816e7b" },
                { "ea_color_darkblue", "#00537a" },
                { "ea_color_darkbrown", "#443528" },
                { "ea_color_lightgrey", "#a6a6a1" },
                { "ea_color_white", "#ffffff" }
            };
            string colorCode = styleValue;
            if (colors.ContainsKey(styleValue))
                colorCode = colors[styleValue];
            return colorCode;
        }

        private string GetTextAlignment(string styleValue)
        {
            Dictionary<string, string> alignments = new Dictionary<string, string>
            {
                { "center", TextAlign.Center.ToString() },
                { "left", TextAlign.Left.ToString() },
                { "right", TextAlign.Right.ToString() }
            };

            string alignment = string.Empty;
            if (alignments.ContainsKey(styleValue))
                alignment = alignments[styleValue];
            return alignment;
        }

        private string GetVerticalAlignment(string styleValue)
        {
            Dictionary<string, string> alignments = new Dictionary<string, string>
            {
                { "top", VerticalAlign.Top.ToString() },
                { "middle", VerticalAlign.Middle.ToString() },
                { "bottom", VerticalAlign.Bottom.ToString() }
            };

            string alignment = string.Empty;
            if (alignments.ContainsKey(styleValue))
                alignment = alignments[styleValue];
            return alignment;
        }

        private string GetFontWeight(string styleValue)
        {
            Dictionary<string, string> fonts = new Dictionary<string, string>
            {
                { "normal", FontWeight.Normal.ToString() },
                { "bold", FontWeight.Bold.ToString() }
            };

            string fontWeight = string.Empty;
            if (fonts.ContainsKey(styleValue))
                fontWeight = fonts[styleValue];
            return fontWeight;
        }

        private string GetFontSize(string styleValue)
        {
            Dictionary<string, string> fonts = new Dictionary<string, string>
            {
                { "small", FontSize.Small.ToString() },
                { "normal", FontSize.Normal.ToString() },
                { "large", FontSize.Large.ToString() }
            };

            string fontSize = styleValue;
            if (fonts.ContainsKey(styleValue))
                fontSize = fonts[styleValue];
            return fontSize;
        }

        private string GetTextSize(string styleValue)
        {
            return styleValue == "long" ? TextVersion.Long.ToString() : TextVersion.Short.ToString();
        }

        private void SetParent(List<AngleSchemaResource> schema)
        {
            List<AreaCoordinate> allCoordinate = schema[schema.Count - 1].Details;
            foreach (var detail in allCoordinate)
            {
                detail.ParentName = FindParent(detail, allCoordinate);
            }
        }

        private string FindParent(AreaCoordinate currentCoordinate, List<AreaCoordinate> allCoordinates)
        {
            allCoordinates = allCoordinates.Where(filter => filter.Name != currentCoordinate.Name).ToList();

            Rectangle currentRectangle = new Rectangle(currentCoordinate.Coordinate[0], currentCoordinate.Coordinate[1], currentCoordinate.Coordinate[2], currentCoordinate.Coordinate[3]);

            foreach (var coor in allCoordinates)
            {
                Rectangle rectangle = new Rectangle(coor.Coordinate[0], coor.Coordinate[1], coor.Coordinate[2], coor.Coordinate[3]);
                if (rectangle.Contains(currentRectangle))
                {
                    currentCoordinate.ParentName = coor.Name;
                    currentCoordinate.CSSClass = "SubClass";
                    break;
                }
            }
            return currentCoordinate.ParentName;
        }
    }
}
