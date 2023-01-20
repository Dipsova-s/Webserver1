using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.ManagementConsole.Models;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.ManagementConsole.Helpers
{
    public static class SiteMapHelper
    {
        public static List<SiteMapModel.SiteMap> GetSiteMap(bool useCache)
        {
            List<SiteMapModel.SiteMap> siteMaps = useCache ? HttpContext.Current.Session["Sitemaps"] as List<SiteMapModel.SiteMap> : null;
            if (siteMaps == null)
            {
                AuthorizationHelper authorizationHelper = AuthorizationHelper.Initialize();
                IModelService modelService = new ModelService();
                SiteMapModel modelSiteMap = new SiteMapModel(authorizationHelper, modelService);
                modelSiteMap.CreateSiteMap();
                siteMaps = modelSiteMap.GetSiteMaps();
            }
            return siteMaps;
        }

        public static SiteMapModel.SiteMap GetSiteMapByHashPath(string path)
        {
            string[] list = path.Split('/');
            List<SiteMapModel.SiteMap> sitemapQuery = GetSiteMap(true);
            SiteMapModel.SiteMap sitemapNode = null;

            if (sitemapQuery != null)
            {
                foreach (string id in list)
                {
                    SiteMapModel.SiteMap query = sitemapQuery.FirstOrDefault(sitemap => sitemap.Id == id);
                    if (query != null)
                    {
                        sitemapNode = query;
                        sitemapQuery = query.Childs;
                    }
                    else
                    {
                        break;
                    }
                }
            }

            if (sitemapNode == null)
            {
                sitemapNode = new SiteMapModel.SiteMap();
            }

            return sitemapNode;
        }

        /// <summary>
        /// Store sitemap into session
        /// </summary>
        /// <param name="model"></param>
        public static void SetSiteMaps(List<SiteMapModel.SiteMap> model)
        {
            HttpContext.Current.Session["Sitemaps"] = model;
        }

        /// <summary>
        /// Get hash path, e.g. #/Overview
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static string ActionHash(string path)
        {
            string[] list = path.Split('/');
            StringBuilder actionResult = new StringBuilder("#/");

            List<SiteMapModel.SiteMap> sitemapQuery = GetSiteMap(true);
            if (sitemapQuery != null)
            {
                foreach (string id in list)
                {
                    var query = sitemapQuery.Where(sitemap => sitemap.Id == id);
                    if (query.Any())
                    {
                        actionResult.Append(query.First().Name.Trim() + "/");
                        sitemapQuery = query.First().Childs;
                    }
                    else
                    {
                        break;
                    }
                }
            }

            return actionResult.ToString();
        }

        /// <summary>
        /// Create html elements from sitemap
        /// </summary>
        /// <param name="model"></param>
        /// <param name="level"></param>
        /// <returns></returns>
        public static MvcHtmlString RenderItem(SiteMapModel.SiteMap model, int level)
        {
            StringBuilder htmlBuilder = new StringBuilder();
            htmlBuilder.AppendFormat("<li id=\"sideMenu-{0}\" class=\"{1} {2} {3}\">",
                model.HashPath.Replace("/", "-").Replace(" ", ""),
                model.IsText ? $"sideMenuLevel{level}Category" : string.Empty,
                model.Childs != null && model.ChildsVisible.GetValueOrDefault() ? "sideMenuWithChild" : string.Empty,
                model.Visible.GetValueOrDefault() ? string.Empty : "alwaysHidden");
            if (model.IsText)
            {
                htmlBuilder.AppendFormat("<span class=\"sideMenuLabel\">{0}</span>", model.Name);
            }
            else
            {
                htmlBuilder.AppendFormat("<a href=\"{0}\" data-url=\"{1}\" {2} onclick=\"MC.sideMenu.click(event, this);\">"
                            + "<span class=\"icon\"></span>"
                            + "<span class=\"sideMenuLabel\">{3}</span>"
                        + "</a>",
                        ActionHash(model.HashPath),
                        model.Uri == null ? "" : VirtualPathUtility.ToAbsolute(model.Uri),
                        model.Parameters == null ?
                            string.Empty :
                            $"data-parameters='{Newtonsoft.Json.JsonConvert.SerializeObject(model.Parameters)}'",
                        model.Name);
            }

            if (model.Childs != null)
            {
                htmlBuilder.AppendFormat(
                    "<ul id=\"sideMenu-{0}-childs\" class=\"unstyled sideMenuLevel{1} {2}\">",
                    model.HashPath.Replace("/", "-"),
                    level + 1,
                    model.ChildsVisible.Value ? "" : "alwaysHidden");
                foreach (var item in model.Childs)
                {
                    htmlBuilder.Append(RenderItem(item, level + 1));
                }
                htmlBuilder.Append("</ul>");
            }

            htmlBuilder.Append("</li>");

            return MvcHtmlString.Create(htmlBuilder.ToString());
        }
    }
}
