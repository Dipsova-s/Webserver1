using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Logging;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class AngleWarningsContentInputter : IAngleWarningsContentInputter
    {
        private const string ClassFieldSeperator = "__";
        private readonly IAngleWarningsFileManager _angleWarningsFileManager;

        private readonly IClassReferencesManager _classReferencesManager;

        public List<AngleWarningsContentInput> ContentInputList;

        public AngleWarningsContentInputter(IAngleWarningsFileManager angleWarningsFileManager, IClassReferencesManager classReferencesManager)
        {
            _angleWarningsFileManager = angleWarningsFileManager ?? throw new System.ArgumentNullException(nameof(angleWarningsFileManager));
            _classReferencesManager = classReferencesManager ?? throw new System.ArgumentNullException(nameof(classReferencesManager));

            ContentInputList = new List<AngleWarningsContentInput>();
        }

        public void Initialize(string fieldSourcesUri, string classesUri)
        {
            _classReferencesManager.Initialize(fieldSourcesUri, classesUri);
        }

        private void AddContentInputItem(WarningFix fix, string version, string objectClass, string fieldToReplace, string newField)
        {
            ContentInputList.Add(new AngleWarningsContentInput(fix, version, objectClass, fieldToReplace, newField));
        }


        public bool TryReadInputList()
        {
            bool succeeded = true;

            try
            {
                ContentInputList.Clear();

                List<string> csvData = _angleWarningsFileManager.ReadContentInputExcelFileFromDisk();

                foreach (string line in csvData)
                {
                    string[] inputLine = line.Split(',');

                    WarningFix warningFix = InputContentMapper.GetWarningTypeEnum(inputLine[1]);
                    if (warningFix == WarningFix.NotSupportedMethod)
                    {
                        continue;
                    }

                    if (inputLine.Length < 6 && warningFix != WarningFix.RemoveColumn)
                    {
                        throw new Exception("All row must have at least six columns.");
                    }

                    if (inputLine.Length < 5 && warningFix == WarningFix.RemoveColumn)
                    {
                        throw new Exception("All row with 'Remove Column' must have at least five columns.");
                    }

                    if (warningFix == WarningFix.RemoveColumn)
                    {
                        ArrayHelper.AddElementToStringArray(ref inputLine, "");
                    }
                    
                    AddContentInputItem(warningFix, inputLine[2], inputLine[3], inputLine[4], inputLine[5]);
                }

                ContentInputList = ContentInputList.OrderBy(x => x.Order).ToList();

                CheckIfFieldHasChangedAgainInLaterReleases();
            }
            catch (Exception ex)
            {
                Log.SendWarning("Angle warnings, reading input file failed: {0}", ex.Message);
                succeeded = false;
            }

            return succeeded;
        }

        //The  order of a content input item is meant for determining if a field has been changed in a later version
        // So: In 2019 Field A was changed into Field B
        //     In 2020 Field B was changed into Field C
        // Method CheckIfFieldHasChangedAgainInLaterReleases then changes the contentinput for the 2019 field:
        // OldField = Field A, new field is Field C

        private void CheckIfFieldHasChangedAgainInLaterReleases()
        {
            foreach (var item in ContentInputList)
            {
                AngleWarningsContentInput contentInput;
                do
                {
                    contentInput = item.Fix == WarningFix.ReplaceClass
                        ? GetFirstNewContentInputItem(item.Fix, item.NewFieldOrClass, item.Order, item.NewFieldOrClass)
                        : GetFirstNewContentInputItem(item.Fix, item.ObjectClass, item.Order, item.NewFieldOrClass);

                    if (contentInput != default(AngleWarningsContentInput))
                    {
                        item.NewFieldOrClass = contentInput.NewFieldOrClass;
                    }

                } while (contentInput != default(AngleWarningsContentInput));
            }
        }

        private AngleWarningsContentInput GetFirstNewContentInputItem(WarningFix fix, string objectClass, int order, string newField)
        {
            return ContentInputList.FirstOrDefault(x => x.Fix == fix &&
                                         x.ObjectClass == objectClass &&
                                         x.Order > order &&
                                         x.FieldOrClassToReplace == newField);
        }

        private AngleWarningsContentInput GetContentInputItemReference(string objectClass, string oldReference)
        {
            return ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceReference &&
                                                   x.ObjectClass == objectClass &&
                                                   x.FieldOrClassToReplace == oldReference);


        }

        private AngleWarningsContentInput GetContentInputItemFieldChanged(string newReference, string oldField)
        {
            return ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                   x.ObjectClass == newReference &&
                                                   x.FieldOrClassToReplace == oldField);
        }


        // ItemSolver is meant to be given to the angle warnings tool api as is.
        // So this gives back how the warning can be solved.
        public ItemSolver GetSolveItem(string warning, string objectClass, string field, string jump)
        {
            ItemSolver itemSolver = new ItemSolver
            {
                Fix = WarningFix.NoFixAvailable
            };

            if (jump != null)
            {
                return GetSolveItemFromJumpWarning(warning, objectClass, jump, itemSolver);
            }

            if (InputContentMapper.Maps(WarningFix.RemoveColumn, warning))
            {
                CheckSolveItemRemoveColumn(objectClass, field, ref itemSolver);
                if (itemSolver.Fix != WarningFix.NoFixAvailable)
                    return itemSolver;
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceReference, warning))
            {
                CheckSolveItemFromReferenceWarning(objectClass, field, ref itemSolver);
                if (itemSolver.Fix != WarningFix.NoFixAvailable)
                    return itemSolver;
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceField, warning))
            {
                return GetSolveItemFromFieldWarning(objectClass, field, itemSolver);
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceClass, warning))
            {
                return GetSolveItemFromClassWarning(objectClass, itemSolver);
            }

            return itemSolver;
        }

        private void CheckSolveItemRemoveColumn(string objectClass, string field, ref ItemSolver itemSolver)
        {
            AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.RemoveColumn &&
                                                                                     x.ObjectClass == objectClass &&
                                                                                     x.FieldOrClassToReplace == field &&
                                                                                     x.NewFieldOrClass == "");
            if (contentInput != null)
            {
                itemSolver.Fix = WarningFix.RemoveColumn;
                itemSolver.ObjectClass = objectClass;
                itemSolver.FieldOrClassToReplace = field;
                itemSolver.NewFieldOrClass = "";
            }
        }

        private void CheckSolveItemFromReferenceWarning(string objectClass, string field, ref ItemSolver itemSolver)
        {
            string oldReference = GetReferenceFromReferenceField(field);
            string oldField = GetFieldFromReferenceField(field);

            AngleWarningsContentInput contentInput = GetContentInputItemReference(objectClass, oldReference);
            if (contentInput != null)
            {
                // New reference found, but maybe that has a field change
                AngleWarningsContentInput contentInput2 = GetContentInputItemFieldChanged(contentInput.NewFieldOrClass, oldField);
                if (contentInput2 != null)
                {
                    itemSolver.Fix = WarningFix.ReplaceField;
                    itemSolver.ObjectClass = objectClass;
                    itemSolver.FieldOrClassToReplace = field;
                    itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass + ClassFieldSeperator + contentInput2.NewFieldOrClass;
                }
                else
                {
                    itemSolver.Fix = WarningFix.ReplaceField;
                    itemSolver.ObjectClass = objectClass;
                    itemSolver.FieldOrClassToReplace = field;

                    if (contentInput.NewFieldOrClass.Equals("SELF", StringComparison.InvariantCultureIgnoreCase))
                    {
                        itemSolver.NewFieldOrClass = oldField;
                    }
                    else
                    {
                        itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass + ClassFieldSeperator + oldField;
                    }
                }
            }
        }

        private ItemSolver GetSolveItemFromClassWarning(string objectClass, ItemSolver itemSolver)
        {
            AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceClass &&
                                                                     x.ObjectClass == objectClass &&
                                                                     x.FieldOrClassToReplace == objectClass);

            if (contentInput != null)
            {
                itemSolver.Fix = contentInput.Fix;
                itemSolver.ObjectClass = objectClass;
                itemSolver.FieldOrClassToReplace = objectClass;
                itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
            }

            return itemSolver;
        }

        private ItemSolver GetSolveItemFromFieldWarning(string objectClass, string field, ItemSolver itemSolver)
        {
            // If the object in the angle is the same as the object in the Excel file, simply use that plain solution
            itemSolver = GetSolveItemIfObjectsAreSame(objectClass, field, itemSolver);

            if (itemSolver.Fix != WarningFix.NoFixAvailable)
            {
                return itemSolver;
            }

            string oldObject = GetObjectFromField(objectClass, field);
            string oldField = GetFieldFromField(field);

            // Check if we can find an Excel line with where the field of the object has been renamed.
            AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                                                          x.ObjectClass == oldObject &&
                                                                                          x.FieldOrClassToReplace == oldField);

            // If not, check if the object is a reference to another object and check for that object is the field has been renamed.
            if (contentInput == null)
            {
                string referencedClass = _classReferencesManager.GetReferencedClass(oldObject);
                contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                                    x.ObjectClass == referencedClass &&
                                                                    x.FieldOrClassToReplace == oldField);
            }

            if (contentInput != null)
            {
                itemSolver.Fix = contentInput.Fix;
                itemSolver.ObjectClass = objectClass;
                itemSolver.FieldOrClassToReplace = field;

                // If new field is reference + field then just apply that, Jira M4-98249
                if (contentInput.NewFieldOrClass.Contains("__"))
                {
                    itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
                }
                else
                {
                    itemSolver.NewFieldOrClass = objectClass == oldObject ? contentInput.NewFieldOrClass : oldObject + ClassFieldSeperator + contentInput.NewFieldOrClass;
                }
            }

            return itemSolver;
        }

        private ItemSolver GetSolveItemIfObjectsAreSame(string objectClass, string field, ItemSolver itemSolver)
        {
            AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                                         x.ObjectClass == objectClass &&
                                                                         x.FieldOrClassToReplace == field);

            if (contentInput != null)
            {
                itemSolver.Fix = contentInput.Fix;
                itemSolver.ObjectClass = objectClass;
                itemSolver.FieldOrClassToReplace = field;
                itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;

                return itemSolver;
            }

            return itemSolver;
        }

        private ItemSolver GetSolveItemFromJumpWarning(string warning, string objectClass, string jump, ItemSolver itemSolver)
        {
            AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => InputContentMapper.Maps(x.Fix, warning) &&
                                                                                     x.ObjectClass == objectClass &&
                                                                                     x.FieldOrClassToReplace == jump);

            if (contentInput != null)
            {
                itemSolver.Fix = WarningFix.ReplaceJump;
                itemSolver.ObjectClass = objectClass;
                itemSolver.FieldOrClassToReplace = jump;
                itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
            }

            return itemSolver;
        }

        private string GetReferenceFromReferenceField(string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { ClassFieldSeperator }, StringSplitOptions.None);
            if (split.Length == 2)
            {
                return split[0];

            }

            return null;
        }

        private string GetFieldFromReferenceField(string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { ClassFieldSeperator }, StringSplitOptions.None);
            if (split.Length == 2)
            {
                return split[1];

            }

            return null;
        }

        private string GetObjectFromField(string objectClass, string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { ClassFieldSeperator }, StringSplitOptions.None);
            if (split.Length == 1)
            {
                return objectClass;
            }

            if (split.Length == 2)
            {
                return split[0];
            }

            return null;
        }

        private string GetFieldFromField(string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { ClassFieldSeperator }, StringSplitOptions.None);
            if (split.Length == 1)
            {
                return split[0];
            }

            if (split.Length == 2)
            {
                return split[1];
            }

            return null;
        }
    }
}