using System.Collections.Generic;
using System.Linq;
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
                SessionHelper sessionHelper = SessionHelper.Initialize();
                IModelService modelService = new ModelService();
                SiteMapModel modelSiteMap = new SiteMapModel(sessionHelper, modelService);
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
            string actionResult = "#/";

            List<SiteMapModel.SiteMap> sitemapQuery = GetSiteMap(true);
            if (sitemapQuery != null)
            {
                foreach (string id in list)
                {
                    var query = sitemapQuery.Where(sitemap => sitemap.Id == id);
                    if (query.Count() > 0)
                    {
                        actionResult += query.First().Name.Trim() + "/";
                        sitemapQuery = (List<SiteMapModel.SiteMap>)query.First().Childs;
                    }
                    else
                    {
                        break;
                    }
                }
            }

            return actionResult;
        }

        /// <summary>
        /// Create html elements from sitemap
        /// </summary>
        /// <param name="model"></param>
        /// <param name="level"></param>
        /// <returns></returns>
        public static MvcHtmlString RenderItem(SiteMapModel.SiteMap model, int level)
        {
            string html = "<li id=\"sideMenu-" + model.HashPath.Replace("/", "-") + "\" class=\"" + (model.IsText ? "sideMenuLevel" + level + "Category" : "") + (model.Childs != null && model.ChildsVisible.Value ? " sideMenuWithChild" : "") + (model.Visible.Value == true ? "" : " alwaysHidden") + "\">";

            if (model.IsText)
            {
                html += "<span class=\"sideMenuLabel\">" + model.Name + "</span>";
            }
            else
            {
                html += "<a href=\"" + ActionHash(model.HashPath) + "\" data-url=\"" + (model.Uri == null ? "" : VirtualPathUtility.ToAbsolute(model.Uri)) + "\"" + (model.Parameters == null ? "" : " data-parameters='" + Newtonsoft.Json.JsonConvert.SerializeObject(model.Parameters) + "'") + " onclick=\"MC.sideMenu.click(event, this);\">"
                            + "<span class=\"icon\"></span>"
                            + "<span class=\"sideMenuLabel\">" + model.Name + "</span>"
                        + "</a>";
            }

            if (model.Childs != null)
            {
                html += "<ul id=\"sideMenu-" + model.HashPath.Replace("/", "-") + "-childs\" class=\"unstyled sideMenuLevel" + (level + 1) + (model.ChildsVisible.Value ? "" : " alwaysHidden") + "\">";
                foreach (var item in model.Childs)
                {
                    html += RenderItem(item, level + 1);
                }
                html += "</ul>";
            }

            html += "</li>";

            return MvcHtmlString.Create(html);
        }
    }
}
