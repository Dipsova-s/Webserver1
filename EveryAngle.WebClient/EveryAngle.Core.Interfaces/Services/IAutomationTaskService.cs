using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DataStore;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IAutomationTaskService
    {
        ListViewModel<DataStoresViewModel> GetDatastores(string dataStoresUri);

        DataStoresViewModel GetDatastore(string datastoreUri);

        ListViewModel<DataStorePluginsViewModel> GetDatastorePlugins(string pluginsUri);

        DataStorePluginsViewModel GetDatastorePlugin(string pluginsUri);

        DataStoresViewModel CreateDataStore(string datastoreUri, string datastoreData);

        DataStoresViewModel UpdateDataStore(string datastoreUri, string datastoreData);

        void DeleteDataStore(string datastoreUri);

        string CheckTaskAction(string taskUri, string ActionData);
    }
}
