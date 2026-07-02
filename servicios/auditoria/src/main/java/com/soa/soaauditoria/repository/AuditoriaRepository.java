package com.soa.soaauditoria.repository;

import com.soa.soaauditoria.entity.AuditoriaLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AuditoriaRepository extends JpaRepository<AuditoriaLog, UUID> {
}
