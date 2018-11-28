using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class BaseService
    {
        #region Constant

        public const string PAGABLE_HEADER_ATTRIBUTE = "header";

        #endregion

        #region Public method

        #region Get
        /// <summary>
        /// Get data from api service
        /// </summary>
        /// <typeparam name="T">ViewModel of response data</typeparam>
        /// <param name="uri"></param>
        /// <returns></returns>
        public T Get<T>(string uri) where T : class
        {
            return Request<T>(Method.GET, uri, null, null);
        }

        /// <summary>
        /// Get data from api service
        /// </summary>
        /// <typeparam name="T">ViewModel of response data</typeparam>
        /// <param name="uri"></param>
        /// <param name="resolver">Resolve JObject response into string for mapping with T</param>
        /// <returns></returns>
        public T Get<T>(string uri, Func<JObject, string> resolver)
        {
            return Request<T>(Method.GET, uri, null, resolver);
        }
        #endregion

        #region GetItems
        /// <summary>
        /// Get data from api service as Enumerable
        /// </summary>
        /// <typeparam name="T">ViewModel of response data</typeparam>
        /// <param name="uri"></param>
        /// <returns></returns>
        public IEnumerable<T> GetItems<T>(string uri) where T : class
        {
            Func<JObject, string> resolver = delegate (JObject result)
            {
                return GetResolvedResult(result, null);
            };
            return GetItems<T>(uri, resolver);
        }

        /// <summary>
        /// Get data from api service as Enumerable
        /// </summary>
        /// <typeparam name="T">ViewModel of response data</typeparam>
        /// <param name="uri"></param>
        /// <param name="dataAttribute">Attribute which contains list</param>
        /// <returns></returns>
        public IEnumerable<T> GetItems<T>(string uri, string dataAttribute)
        {
            Func<JObject, string> resolver = delegate (JObject result)
            {
                return ResultResolver(result, dataAttribute);
            };
            return GetItems<T>(uri, resolver);
        }

        /// <summary>
        /// Get data from api service as Enumerable
        /// </summary>
        /// <typeparam name="T">ViewModel of response data</typeparam>
        /// <param name="uri"></param>
        /// <param name="resolver">Resolve JObject response into string for mapping with T</param>
        /// <returns></returns>
        public IEnumerable<T> GetItems<T>(string uri, Func<JObject, string> resolver)
        {
            return Get<IEnumerable<T>>(uri, resolver);
        }
        #endregion

        #region GetArrayItems
        public IEnumerable<T> GetArrayItems<T>(string uri) where T : class
        {
            Func<JArray, string> resolver = delegate (JArray result)
            {
                return GetResolvedResult(result, null);
            };
            return GetArrayItems<T>(uri, resolver);
        }
        public IEnumerable<T> GetArrayItems<T>(string uri, Func<JArray, string> resolver)
        {
            return RequestArray<T>(Method.GET, uri, resolver);
        }
        #endregion

        #region GetPagableItems
        /// <summary>
        /// Get data from api service as ListViewModel
        /// </summary>
        /// <typeparam name="T">ViewModel of response data</typeparam>
        /// <param name="uri"></param>
        /// <param name="dataAttribute">Attribute which contains list</param>
        /// <returns></returns>
        public ListViewModel<T> GetPagableItems<T>(string uri, string dataAttribute) where T : class
        {
            Func<JObject, string> resolver = delegate (JObject result)
            {
                return ListViewModelResolver<T>(result, PAGABLE_HEADER_ATTRIBUTE, dataAttribute);
            };
            return GetPagableItems<T>(uri, resolver);
        }

        /// <summary>
        /// Get data from api service as ListViewModel
        /// </summary>
        /// <typeparam name="T">ViewModel of response data</typeparam>
        /// <param name="uri"></param>
        /// <param name="resolver">Resolve JObject response into string for mapping with T</param>
        /// <returns></returns>
        public ListViewModel<T> GetPagableItems<T>(string uri, Func<JObject, string> resolver)
        {
            return Get<ListViewModel<T>>(uri, resolver);
        }
        #endregion

        #region Create
        /// <summary>
        /// Create
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="uri"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        public T Create<T>(string uri, T model) where T : class
        {
            return Create<T>(uri, model, new List<string>());
        }

        /// <summary>
        /// Create
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="uri"></param>
        /// <param name="model"></param>
        /// <param name="cleanProterties">List of properties to be removed including deep childs</param>
        /// <returns></returns>
        public T Create<T>(string uri, T model, List<string> cleanProterties)
        {
            JsonSerializerSettings settings = new JsonSerializerSettings
            {
                ContractResolver = new CleanUpPropertiesResolver(cleanProterties)
            };
            string body = JsonConvert.SerializeObject(model, settings);
            return Create<T>(uri, body);
        }

        /// <summary>
        /// Create
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="uri"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        public T Create<T>(string uri, string body)
        {
            return Request<T>(Method.POST, uri, body, null);
        }
        #endregion

        #region Update
        /// <summary>
        /// Update
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="model"></param>
        /// <returns></returns>
        public T Update<T>(T model) where T : class
        {
            return Update<T>(model, new List<string>());
        }

        /// <summary>
        /// Update
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="model"></param>
        /// <param name="cleanProterties">List of properties to be removed including deep childs</param>
        /// <returns></returns>
        public T Update<T>(T model, List<string> cleanProterties)
        {
            JsonSerializerSettings settings = new JsonSerializerSettings
            {
                ContractResolver = new CleanUpPropertiesResolver(cleanProterties)
            };
            string uri = GetUri(model);
            string body = JsonConvert.SerializeObject(model, settings);
            return Update<T>(uri, body);
        }

        /// <summary>
        /// Update
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="uri"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        public T Update<T>(string uri, string body)
        {
            return Request<T>(Method.PUT, uri, body, null);
        }
        #endregion

        #region Delete
        /// <summary>
        /// Delete
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="model"></param>
        public void Delete<T>(T model) where T : class
        {
            string uri = GetUri(model);
            Delete(uri);
        }

        /// <summary>
        /// Delete
        /// </summary>
        /// <param name="uri"></param>
        public void Delete(string uri)
        {
            RequestManager.Initialize(uri).Run(Method.DELETE);
        }
        #endregion

        #region Miscellaneous

        /// <summary>
        /// Get response by specific attribute
        /// </summary>
        /// <param name="result"></param>
        /// <param name="attribute">Attribute which needs to return as response</param>
        /// <returns></returns>
        public string ResultResolver(JObject result, string attribute)
        {
            return result.SelectToken(attribute).ToString();
        }

        /// <summary>
        /// Get response as ListViewModelResolver
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="result"></param>
        /// <param name="headerAttribute">Attribute which needs to return as header</param>
        /// <param name="dataAttribute">Attribute which needs to return as response</param>
        /// <returns></returns>
        public string ListViewModelResolver<T>(JObject result, string headerAttribute, string dataAttribute) where T : class
        {
            ListViewModel<T> listView = new ListViewModel<T>
            {
                Header = DeserializeObject<HeaderViewModel>(ResultResolver(result, headerAttribute)),
                Data = DeserializeObject<List<T>>(ResultResolver(result, dataAttribute))
            };
            return JsonConvert.SerializeObject(listView);
        }

        /// <summary>
        /// Get uri from ViewModel
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public virtual string GetUri(object model)
        {
            throw new NotImplementedException();
        }

        #endregion

        #endregion

        #region Private method

        /// <summary>
        /// Request data from api service
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="method"></param>
        /// <param name="uri"></param>
        /// <param name="body"></param>
        /// <param name="resolver"></param>
        /// <returns></returns>
        private T Request<T>(Method method, string uri, string body, Func<JObject, string> resolver)
        {
            var requestManager = RequestManager.Initialize(uri);
            var result = requestManager.Run(method, body);
            return DeserializeObject<T>(GetResolvedResult(result, resolver));
        }

        private IEnumerable<T> RequestArray<T>(Method method, string uri, Func<JArray, string> resolver)
        {
            RequestManager requestManager = RequestManager.Initialize(uri);
            JArray result = requestManager.RunArray(method);
            return DeserializeObject<IEnumerable<T>>(GetResolvedResult(result, resolver));
        }

        /// <summary>
        /// Convert response body to ViewModel
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="value"></param>
        /// <returns></returns>
        private T DeserializeObject<T>(string value)
        {
            return JsonConvert.DeserializeObject<T>(value, new UnixDateTimeConverter());
        }

        /// <summary>
        /// Get resolved result
        /// </summary>
        /// <param name="result"></param>
        /// <param name="resolver"></param>
        /// <returns></returns>
        private string GetResolvedResult(JObject result, Func<JObject, string> resolver)
        {
            return resolver == null ? result.ToString() : resolver(result);
        }

        /// <summary>
        /// Get resolved result
        /// </summary>
        /// <param name="result"></param>
        /// <param name="resolver"></param>
        /// <returns></returns>
        private string GetResolvedResult(JArray result, Func<JArray, string> resolver)
        {
            return resolver == null ? result.ToString() : resolver(result);
        }

        #endregion
    }
}
