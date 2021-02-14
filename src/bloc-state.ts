export abstract class BlocState {
  /**
   * This method is used to compare this state with a current one to determine whether refresh is necessary.
   * By default returns **false**. */
  isEqual(state: BlocState): boolean {
    return false
  }
}
