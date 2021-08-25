namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public interface IClassReferencesManager
    {
        string GetReferencedClass(string reference);
        void Initialize(string fieldSourcesUri, string classesUri);
    }
}