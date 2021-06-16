namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IAngleWarningsContentInput
    {
        string GetClassOrFieldToReplaceString();
        string GetNewFieldString(string startObject);
    }
}