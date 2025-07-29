package com.main.TravelMate.report.service;

import com.main.TravelMate.report.dto.CreateReportRequest;
import com.main.TravelMate.report.entity.Report;
import com.main.TravelMate.report.repository.ReportRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    public void createReport(String reporterEmail, CreateReportRequest request) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new UsernameNotFoundException("신고자 정보 없음"));

        User reported = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new IllegalArgumentException("신고 대상 유저 없음"));

        Report report = new Report();
        report.setReporter(reporter);
        report.setReportedUser(reported);
        report.setReportType(request.getReportType());
        report.setDescription(request.getDescription());

        reportRepository.save(report);
    }
}
