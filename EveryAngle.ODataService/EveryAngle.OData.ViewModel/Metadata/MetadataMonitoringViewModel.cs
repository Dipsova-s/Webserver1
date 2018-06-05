using EveryAngle.OData.ViewModel.Settings;

namespace EveryAngle.OData.ViewModel.Metadata
{
    public class MetadataMonitoringViewModel
    {
        public MetadataMonitoringViewModel(ODataSettingsViewModel currentSettings, int usingMemory)
        {
            is_running = true;
            angles = new ItemMonitoringViewModel();
            displays = new ItemMonitoringViewModel();
            fields = new ItemMonitoringViewModel();
            memory = usingMemory;
            settings = currentSettings;
        }

        public MetadataMonitoringViewModel(
            bool isRunning,
            int usingMemory,
            ODataSettingsViewModel currentSettings,
            ItemMonitoringViewModel anglesViewmodel,
            ItemMonitoringViewModel displaysViewmodel,
            ItemMonitoringViewModel fieldsViewmodel)
        {
            is_running = isRunning;
            memory = usingMemory;
            angles = anglesViewmodel;
            displays = displaysViewmodel;
            fields = fieldsViewmodel;
            settings = currentSettings;
        }

        public bool is_running { get; set; }
        public int memory { get; set; }
        public ItemMonitoringViewModel angles { get; set; }
        public ItemMonitoringViewModel displays { get; set; }
        public ItemMonitoringViewModel fields { get; set; }
        public ODataSettingsViewModel settings { get; set; }

        public MetadataMonitoringViewModel Init(ODataSettingsViewModel currentSettings, int usingMemory)
        {
            return Init(true, 
                        usingMemory, 
                        currentSettings, 
                        new ItemMonitoringViewModel(), 
                        new ItemMonitoringViewModel(), 
                        new ItemMonitoringViewModel());
        }

        public MetadataMonitoringViewModel Init(
            bool isRunning,
            int usingMemory,
            ODataSettingsViewModel currentSettings,
            ItemMonitoringViewModel anglesViewmodel,
            ItemMonitoringViewModel displaysViewmodel,
            ItemMonitoringViewModel fieldsViewmodel)
        {
            is_running = isRunning;
            memory = usingMemory;
            angles = anglesViewmodel;
            displays = displaysViewmodel;
            fields = fieldsViewmodel;
            settings = currentSettings;

            return this;
        }
    }

    public class ItemMonitoringViewModel
    {
        public ItemMonitoringViewModel()
        {
            summary = new ItemMonitoringSummaryViewModel(0, 0, 0);
            available = 0;
            unavailable = 0;
        }

        public ItemMonitoringViewModel(int availables, int unavailables, int total)
        {
            summary = new ItemMonitoringSummaryViewModel(availables, unavailables, total);
            available = total == 0 ? 0 : (decimal)availables * 100 / total;
            unavailable = total == 0 ? 0 : (decimal)unavailables * 100 / total;
        }

        public ItemMonitoringSummaryViewModel summary { get; set; }
        public decimal available { get; set; }
        public decimal unavailable { get; set; }

        public void Init(int availables, int unavailables, int total)
        {
            summary.i = availables;
            summary.u = unavailables;
            summary.t = total;

            available = total == 0 ? 0 : (decimal)availables * 100 / total;
            unavailable = total == 0 ? 0 : (decimal)unavailables * 100 / total;
        }
    }

    public class ItemMonitoringSummaryViewModel
    {
        public ItemMonitoringSummaryViewModel(int items, int unavailables, int total)
        {
            i = items;
            u = unavailables;
            t = total;
        }
        public int i { get; set; }
        public int u { get; set; }
        public int t { get; set; }
    }
}
