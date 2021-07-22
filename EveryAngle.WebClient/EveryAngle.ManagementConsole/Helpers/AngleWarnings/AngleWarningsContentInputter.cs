using EveryAngle.Logging;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class AngleWarningsContentInputter : IAngleWarningsContentInputter
    {
        private const string ClassFieldSeperator = "__";
        private readonly IAngleWarningsFileReader _angleWarningsFileReader;

        public List<AngleWarningsContentInput> ContentInputList;

        public AngleWarningsContentInputter(IAngleWarningsFileReader angleWarningsFileReader)
        {
            _angleWarningsFileReader = angleWarningsFileReader ?? throw new System.ArgumentNullException(nameof(angleWarningsFileReader));

            ContentInputList = new List<AngleWarningsContentInput>();
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

                List<string> csvData = _angleWarningsFileReader.ReadContentInputExcelFileFromDisk();

                foreach (string line in csvData)
                {
                    string[] inputLine = line.Split(',');
                 
                    WarningFix warningFix = InputContentMapper.GetWarningTypeEnum(inputLine[1]);
                    if (warningFix == WarningFix.NotSupportedMethod)
                    {
                        continue;
                    }

                    if (inputLine.Length < 6)
                    {
                        throw new Exception("All row must have at least six columns.");
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

        private void CheckSolveItemFromReferenceWarning(string objectClass, string field, ref ItemSolver itemSolver)
        {
            string oldReference = GetReferenceFromReferenceField(field);
            string oldField = GetFieldFromReferenceField(field);

            AngleWarningsContentInput contentInput = GetContentInputItemReference(objectClass, oldReference);
            if (contentInput != null)
            {
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
                    itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass + ClassFieldSeperator + oldField;
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
            string oldObject = GetObjectFromField(objectClass, field);
            string oldField = GetFieldFromField(field);

            AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                                                     x.ObjectClass == oldObject &&
                                                                                     x.FieldOrClassToReplace == oldField);
            if (contentInput != null)
            {
                itemSolver.Fix = contentInput.Fix;
                itemSolver.ObjectClass = objectClass;
                itemSolver.FieldOrClassToReplace = field;

                itemSolver.NewFieldOrClass = objectClass == oldObject ? contentInput.NewFieldOrClass : oldObject + ClassFieldSeperator + contentInput.NewFieldOrClass;

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