using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Service.Attributes;
using EveryAngle.OData.Utils;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.OData;

namespace EveryAngle.OData.Service.ODataControllers
{
    [ExceptionHandling]
    public class BaseODataController : ODataController
    {
        protected IContext Context
        {
            get { return GetProperty<Context>(EAContext.Context.Key_eaac); }
        }

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            // Tableau support only atom/xml format, maybe create a trigger on/off
            // Excel support both xml and json format, but atom
            string formatType = HttpContext.Current.Request.QueryString.GetQueryArgs<string>("format");
            if (string.IsNullOrEmpty(formatType) || formatType != "json")
                controllerContext.Request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/atom+xml"));

            base.Initialize(controllerContext);
        }

        #region private functions

        private T GetProperty<T>(string tag) where T : class
        {
            return Request.Properties.ContainsKey(tag) && Request.Properties[tag] != null ? Request.Properties[tag] as T : null;
        }

        #endregion
    }
}