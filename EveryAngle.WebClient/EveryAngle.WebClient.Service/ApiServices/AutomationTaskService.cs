using System.Collections.Generic;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DataStore;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class AutomationTaskService : IAutomationTaskService
    {
        public ListViewModel<DataStoresViewModel> GetDatastores(string dataStoresUri)
        {
            var requestManager = RequestManager.Initialize( dataStoresUri);
            var jsonResult = requestManager.Run();
            var datastores = new ListViewModel<DataStoresViewModel>();
            datastores.Data =
                JsonConvert.DeserializeObject<List<DataStoresViewModel>>(jsonResult.SelectToken("datastores").ToString());
            datastores.Header =
                JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return datastores;
        }

        public DataStoresViewModel GetDatastore(string dataStoresUri)
        {
            var requestManager = RequestManager.Initialize( dataStoresUri);
            var jsonResult = requestManager.Run();
            var datastore = JsonConvert.DeserializeObject<DataStoresViewModel>(jsonResult.ToString());
            return datastore;
        }

        public DataStorePluginsViewModel GetDatastorePlugin(string pluginsUri)
        {
            var requestManager = RequestManager.Initialize( pluginsUri);
            var jsonResult = requestManager.Run();
            var datastorePlugin = JsonConvert.DeserializeObject<DataStorePluginsViewModel>(jsonResult.ToString());
            return datastorePlugin;
        }

        public ListViewModel<DataStorePluginsViewModel> GetDatastorePlugins(string pluginsUri)
        {
            var requestManager = RequestManager.Initialize( pluginsUri);
            var jsonResult = requestManager.Run();
            var plugins = new ListViewModel<DataStorePluginsViewModel>();
            plugins.Data =
                JsonConvert.DeserializeObject<List<DataStorePluginsViewModel>>(
                    jsonResult.SelectToken("datastore_plugins").ToString());
            plugins.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return plugins;
        }

        public string CheckTaskAction(string taskActionUri, string data)
        {
            var requestManager = RequestManager.Initialize( taskActionUri);
            var jsonResult = requestManager.Run(RestSharp.Method.POST, data);
            return jsonResult.ToString();
        }


        public DataStoresViewModel CreateDataStore(string dataStoresUri, string data)
        {
            var requestManager = RequestManager.Initialize( dataStoresUri);
            var jsonResult = requestManager.Run(RestSharp.Method.POST, data);
            var datastore = JsonConvert.DeserializeObject<DataStoresViewModel>(jsonResult.ToString());
            return datastore;
        }

        public DataStoresViewModel UpdateDataStore(string dataStoresUri, string data)
        {
            var requestManager = RequestManager.Initialize( dataStoresUri);
            var jsonResult = requestManager.Run(RestSharp.Method.PUT, data);
            var datastore = JsonConvert.DeserializeObject<DataStoresViewModel>(jsonResult.ToString());
            return datastore;
        }

        public void DeleteDataStore(string dataStoresUri)
        {
            var requestManager = RequestManager.Initialize(dataStoresUri);
            requestManager.Run(RestSharp.Method.DELETE);
        }
    }
}
