package main.configs;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.enums.Scope;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
@RequiredArgsConstructor
@Slf4j
public class RoleScopeConstraintSynchronizer implements CommandLineRunner {

    private static final String SCHEMA_NAME = "dbo";
    private static final String TABLE_NAME = "custom_role_scopes";
    private static final String COLUMN_NAME = "scope";
    private static final String CONSTRAINT_NAME = "CK_custom_role_scopes_scope";

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        if (!tableExists()) {
            log.debug("Skipped scope constraint sync because {}.{} does not exist yet.", SCHEMA_NAME, TABLE_NAME);
            return;
        }

        List<String> existingConstraintNames = findExistingConstraintNames();
        for (String constraintName : existingConstraintNames) {
            jdbcTemplate.execute("ALTER TABLE " + qualifiedTableName() + " DROP CONSTRAINT " + bracket(constraintName));
        }

        jdbcTemplate.execute(buildAddConstraintSql());
        log.info("Synchronized {}.{}.{} check constraint with {} enum values.",
                SCHEMA_NAME, TABLE_NAME, COLUMN_NAME, Scope.values().length);
    }

    private boolean tableExists() {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM sys.tables t
                JOIN sys.schemas s ON s.schema_id = t.schema_id
                WHERE s.name = ? AND t.name = ?
                """,
                Integer.class,
                SCHEMA_NAME,
                TABLE_NAME
        );
        return count != null && count > 0;
    }

    private List<String> findExistingConstraintNames() {
        return jdbcTemplate.queryForList(
                """
                SELECT DISTINCT cc.name
                FROM sys.check_constraints cc
                JOIN sys.tables t ON t.object_id = cc.parent_object_id
                JOIN sys.schemas s ON s.schema_id = t.schema_id
                WHERE s.name = ?
                  AND t.name = ?
                  AND (
                        cc.parent_column_id = (
                            SELECT TOP 1 c.column_id
                            FROM sys.columns c
                            WHERE c.object_id = t.object_id
                              AND c.name = ?
                        )
                        OR cc.definition LIKE '%[[]scope[]]%'
                      )
                """,
                String.class,
                SCHEMA_NAME,
                TABLE_NAME,
                COLUMN_NAME
        );
    }

    private String buildAddConstraintSql() {
        String allowedValues = Arrays.stream(Scope.values())
                .map(Scope::name)
                .map(scope -> "'" + scope + "'")
                .collect(Collectors.joining(", "));

        return "ALTER TABLE " + qualifiedTableName()
                + " ADD CONSTRAINT " + bracket(CONSTRAINT_NAME)
                + " CHECK (" + bracket(COLUMN_NAME) + " IN (" + allowedValues + "))";
    }

    private String qualifiedTableName() {
        return bracket(SCHEMA_NAME) + "." + bracket(TABLE_NAME);
    }

    private String bracket(String identifier) {
        return "[" + identifier.replace("]", "]]") + "]";
    }
}
