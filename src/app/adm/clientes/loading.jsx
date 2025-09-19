import styles from "./loading.module.css";

export default function Loading() {
    return (
        <main className={styles.wrap} aria-busy="true" aria-live="polite">
            <div
                role="img"
                aria-label="Hámster corriendo en una rueda mientras se carga la página"
                className={styles["wheel-and-hamster"]}
            >
                <div className={styles.wheel} />
                <div className={styles.hamster}>
                    <div className={styles["hamster__body"]}>
                        <div className={styles["hamster__head"]}>
                            <div className={styles["hamster__ear"]} />
                            <div className={styles["hamster__eye"]} />
                            <div className={styles["hamster__nose"]} />
                        </div>
                        <div className={`${styles["hamster__limb"]} ${styles["hamster__limb--fr"]}`} />
                        <div className={`${styles["hamster__limb"]} ${styles["hamster__limb--fl"]}`} />
                        <div className={`${styles["hamster__limb"]} ${styles["hamster__limb--br"]}`} />
                        <div className={`${styles["hamster__limb"]} ${styles["hamster__limb--bl"]}`} />
                        <div className={styles["hamster__tail"]} />
                    </div>
                </div>
                <div className={styles.spoke} />
            </div>

            <p className={styles.msg}>Cargando…</p>
        </main>
    );
}
