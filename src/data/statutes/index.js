// Statutory Retrieval Utility
export const STATUTE_MAP = {
  RSA: "Restatement (Third) of Agency",
  RUPA: "Revised Uniform Partnership Act",
  RULLCA: "Revised Uniform Limited Liability Company Act",
  MBCA: "Model Business Corporation Act",
  DGCL: "Delaware General Corporation Law",
  UVTA: "Uniform Voidable Transactions Act",
};

export const statutes = {
  RSA: {
    "1.01": {
      title: "Agency Defined",
      text: "Agency is the fiduciary relationship that arises when one person (a 'principal') manifests assent to another person (an 'agent') that the agent shall act on the principal's behalf and subject to the principal's control, and the agent manifests assent or otherwise consents so to act.",
    },
    "2.01": {
      title: "Actual Authority",
      text: "An agent acts with actual authority when, at the time of taking action that has legal consequences for the principal, the agent reasonably believes, in accordance with the principal's manifestations to the agent, that the principal wishes the agent so to act.",
    },
    "2.03": {
      title: "Apparent Authority",
      text: "Apparent authority is the power held by an agent or other actor to affect a principal's legal relations with third parties when a third party reasonably believes the actor has authority to act on behalf of the principal and that belief is traceable to the principal's manifestations.",
    },
    "7.07": {
      title: "Employee Acting Within Scope of Employment",
      text: "An employer is subject to vicarious liability for a tort committed by its employee acting within the scope of employment.",
    },
  },
  RUPA: {
    "202": {
      title: "Formation of Partnership",
      text: "Except as otherwise provided in subsection (b), the association of two or more persons to carry on as co-owners a business for profit forms a partnership, whether or not the persons intend to form a partnership.",
    },
    "301": {
      title: "Partner as Agent",
      text: "Each partner is an agent of the partnership for the purpose of its business. An act of a partner, including the execution of an instrument in the partnership name, for apparently carrying on in the ordinary course the partnership business or business of the kind carried on by the partnership binds the partnership, unless the partner had no authority to act for the partnership in the particular matter and the person with whom the partner was dealing knew or had received a notification that the partner lacked authority.",
    },
    "306": {
      title: "Partner's Liability",
      text: "Except as otherwise provided in subsections (b) and (c), all partners are liable jointly and severally for all debts, obligations, and other liabilities of the partnership unless otherwise agreed by the claimant or provided by law.",
    },
  },
  RULLCA: {
    "110": {
      title: "Operating Agreement; Scope, Function, and Limitations",
      text: "Except as otherwise provided in subsections (b) and (c), the operating agreement governs: (1) relations among the members as members and between the members and the limited liability company; (2) the rights and duties under this [act] of a person in the capacity of manager; (3) the activities and affairs of the company and the conduct of those activities and affairs; and (4) the means and conditions for amending the operating agreement.",
    },
    "304": {
      title: "Charging Order",
      text: "On application by a judgment creditor of a member or transferee, a court may enter a charging order against the transferable interest of the judgment debtor for the unsatisfied amount of the judgment.",
    },
  },
  MBCA: {
    "2.01": {
      title: "Purposes",
      text: "Every corporation incorporated under this Act has the purpose of engaging in any lawful business unless a more limited purpose is set forth in the articles of incorporation.",
    },
    "8.30": {
      title: "Standards of Conduct for Directors",
      text: "Each member of the board of directors, when discharging the duties of a director, shall act: (1) in good faith; and (2) in a manner the director reasonably believes to be in the best interests of the corporation.",
    },
    "8.42": {
      title: "Standards of Conduct for Officers",
      text: "An officer, when performing in such capacity, has the duty to act: (1) in good faith; (2) with the care that a person in a like position would reasonably exercise under similar circumstances; and (3) in a manner the officer reasonably believes to be in the best interests of the corporation.",
    },
  },
  DGCL: {
    "102": {
      title: "Contents of Certificate of Incorporation",
      text: "The certificate of incorporation shall set forth: (1) The name of the corporation, which shall contain 1 of the words 'association,' 'company,' 'corporation,' 'club,' 'foundation,' 'fund,' 'incorporated,' 'institute,' 'society,' 'union,' 'syndicate,' or 'limited,' or one of the abbreviations 'co.,' 'corp.,' 'inc.,' 'ltd.,' or words or abbreviations of like import of another language...",
    },
    "141": {
      title: "Board of Directors; Powers; Number, Qualifications, Terms and Quorum",
      text: "The business and affairs of every corporation organized under this chapter shall be managed by or under the direction of a board of directors, except as may be otherwise provided in this chapter or in its certificate of incorporation.",
    },
  },
  UVTA: {
    "4": {
      title: "Transfer or Obligation Voidable as to Present or Future Creditor",
      text: "A transfer made or obligation incurred by a debtor is voidable as to a creditor, whether the creditor's claim arose before or after the transfer was made or the obligation was incurred, if the debtor made the transfer or incurred the obligation: (1) with actual intent to hinder, delay, or defraud any creditor of the debtor; or (2) without receiving a reasonably equivalent value in exchange for the transfer or obligation...",
    },
  },
};

export function getStatute(shortName, section) {
  const law = statutes[shortName];
  if (!law) return null;
  return law[section] || null;
}
