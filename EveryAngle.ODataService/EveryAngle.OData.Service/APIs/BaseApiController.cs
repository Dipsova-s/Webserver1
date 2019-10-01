using EveryAngle.OData.EAContext;
using EveryAngle.OData.Service.Attributes;
using EveryAngle.OData.Utils;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Http;

namespace EveryAngle.OData.Service.APIs
{
    [ValidateModel]
    public class BaseApiController : ApiController
    {
        protected IContext Context
        {
            get { return GetProperty<Context>(EAContext.Context.Key_eaac); }
        }

        protected HttpResponseMessage CreateResponse(object value)
        {
            return CreateResponse(HttpStatusCode.OK, value);
        }
        protected HttpResponseMessage CreateResponse(HttpStatusCode statusCode, object value)
        {
            return ActionContext.Request.CreateResponse(statusCode, value);
        }

        protected T GetQueryArgs<T>(string key)
        {
            NameValueCollection query = HttpContext.Current.Request.QueryString;
            if (query.HasKeys() && query.GetValues(key) != null)
                return query.Get(key).As<T>();

            return default(T);
        }

        protected T GetQueryArgsAsViewModel<T>()
        {
            string requestString = HttpUtility.UrlDecode(HttpContext.Current.Request.QueryString.ToString());
            try
            {
                return JsonConvert.DeserializeObject<T>(requestString);
            }
            catch
            {
                return default(T);
            }
        }

        protected T GetViewModel<T>() where T : new()
        {
            HttpContent requestContent = Request.Content;
            string requestString = requestContent.ReadAsStringAsync().Result;
            try
            {
                return JsonConvert.DeserializeObject<T>(requestString);
            }
            catch
            {
                return default(T);
            }
        }

        private T GetProperty<T>(string tag) where T : class
        {
            return Request.Properties.ContainsKey(tag) && Request.Properties[tag] != null ? Request.Properties[tag] as T : null;
        }
    }
}