import { useState } from "react";
import { Button } from "@/components/button/Button";
import { SearchInput } from "@/components/search-input/SearchInput";
import { matchesQuery } from "@/core/lib/textSearch";
import { armyIndex } from "@/data/armyIndex";
import { ArmyCard } from "./army-card/ArmyCard";
import styles from "./Home.module.css";

export const Home = () => {
  const [search, setSearch] = useState("");

  const armies = armyIndex.filter(({ name }) => matchesQuery(name, search));
  const isEmpty = armies.length === 0;

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.heading}>Warmaster Revolution Armies</h1>
        <div className={styles.search}>
          <SearchInput
            label="Search armies"
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>
      {isEmpty ? (
        <div className={styles.empty}>
          <p className={styles.emptyMessage}>
            No army matches “{search.trim()}”.
          </p>
          <Button variant="ghost" size="sm" onClick={clearSearch}>
            Clear search
          </Button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {armies.map(({ id, name }) => (
            <li key={id}>
              <ArmyCard id={id} name={name} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};
